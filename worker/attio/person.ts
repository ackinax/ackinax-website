/**
 * Resolves a submission's identity to exactly one Attio Person, enriching
 * rather than overwriting (R3, R4). Query-then-write, not upsert (KTD1):
 * Attio's upsert only accepts a unique matching attribute (email is the
 * only one People has), and its documented semantics replace every OTHER
 * multiselect value in the payload - sending a partial phone array there
 * would delete phones a prior submission recorded.
 */

import type { AttioClient, AttioFailure } from "./client";
import type { MatchKeyKind, NormalizedIdentity } from "../identity";

interface AttioPersonRecord {
  id: { record_id: string };
  values: {
    email_addresses?: Array<{ email_address?: string }>;
    telegram?: Array<{ value?: string }>;
    phone_numbers?: Array<{ phone_number?: string }>;
  };
}

export interface PersonInput {
  name?: string;
  identity: NormalizedIdentity;
}

export interface PersonOutcome {
  recordId: string;
  action: "created" | "patched";
  /** KTD3: set when a human should sanity-check this resolution. */
  possibleDuplicate: boolean;
  /**
   * Identifiers this submission carried that the matched record did not
   * already have - only meaningful when action is "patched" (RK6: an
   * unexpected enrichment of an established contact should be visible).
   * Always empty for a "created" outcome - there is no pre-existing
   * record to enrich.
   */
  newlyAddedIdentifiers: MatchKeyKind[];
}

export type PersonResult = { ok: true; person: PersonOutcome } | { ok: false; error: string };

const IDENTIFIER_KINDS: readonly MatchKeyKind[] = ["email", "telegram", "phone"];

function describeFailure(result: AttioFailure): string {
  return result.message ?? `Attio request failed with status ${result.status}`;
}

function buildOrFilter(identity: NormalizedIdentity): Record<string, unknown> {
  const branches: unknown[] = [];
  if (identity.email) branches.push({ email_addresses: { email_address: { $eq: identity.email } } });
  if (identity.telegram) branches.push({ telegram: { $eq: identity.telegram } });
  if (identity.phone) branches.push({ phone_numbers: { phone_number: { $eq: identity.phone } } });
  return { $or: branches };
}

async function queryPeopleOnce(client: AttioClient, identity: NormalizedIdentity) {
  return client.post<AttioPersonRecord[]>("/v2/objects/people/records/query", {
    filter: buildOrFilter(identity),
    limit: 10,
  });
}

/** KTD4: reads may retry once on failure; writes never do. */
async function queryPeopleWithRetry(client: AttioClient, identity: NormalizedIdentity) {
  const first = await queryPeopleOnce(client, identity);
  if (first.ok) return first;
  return queryPeopleOnce(client, identity);
}

/** Which of the submission's identifiers this record's stored values already carry. */
function matchedIdentifiers(record: AttioPersonRecord, identity: NormalizedIdentity): Set<MatchKeyKind> {
  const matched = new Set<MatchKeyKind>();

  const emails = (record.values.email_addresses ?? []).map((e) => e.email_address?.toLowerCase());
  if (identity.email && emails.includes(identity.email)) matched.add("email");

  const handles = (record.values.telegram ?? []).map((t) => t.value?.toLowerCase());
  if (identity.telegram && handles.includes(identity.telegram)) matched.add("telegram");

  const phones = (record.values.phone_numbers ?? []).map((p) => p.phone_number);
  if (identity.phone && phones.includes(identity.phone)) matched.add("phone");

  return matched;
}

/** KTD2: email outranks Telegram outranks phone. */
function precedenceRank(matched: Set<MatchKeyKind>): number {
  if (matched.has("email")) return 0;
  if (matched.has("telegram")) return 1;
  return 2;
}

function buildValues(name: string | undefined, identity: NormalizedIdentity, restrictTo?: Set<MatchKeyKind>) {
  const values: Record<string, unknown> = {};
  const include = (kind: MatchKeyKind) => !restrictTo || restrictTo.has(kind);

  if (name) values.name = { full_name: name };
  if (identity.email && include("email")) values.email_addresses = [identity.email];
  if (identity.telegram && include("telegram")) values.telegram = identity.telegram;
  // A phone that failed normalization is already absent from `identity` - KTD8's
  // "never send a malformed phone" falls out of building from normalized identity.
  if (identity.phone && include("phone")) values.phone_numbers = [identity.phone];

  return values;
}

async function createPerson(client: AttioClient, input: PersonInput, possibleDuplicate: boolean): Promise<PersonResult> {
  const values = buildValues(input.name, input.identity);
  const result = await client.post<{ id: { record_id: string } }>("/v2/objects/people/records", { data: { values } });
  if (!result.ok) return { ok: false, error: describeFailure(result) };
  return {
    ok: true,
    person: { recordId: result.data.id.record_id, action: "created", possibleDuplicate, newlyAddedIdentifiers: [] },
  };
}

async function patchPerson(
  client: AttioClient,
  recordId: string,
  input: PersonInput,
  restrictTo: Set<MatchKeyKind> | undefined,
  alreadyMatched: Set<MatchKeyKind>,
  possibleDuplicate: boolean,
): Promise<PersonResult> {
  const values = buildValues(input.name, input.identity, restrictTo);
  const result = await client.patch<{ id: { record_id: string } }>(`/v2/objects/people/records/${recordId}`, {
    data: { values },
  });
  if (!result.ok) return { ok: false, error: describeFailure(result) };

  const written = IDENTIFIER_KINDS.filter(
    (kind) => input.identity[kind] !== undefined && (!restrictTo || restrictTo.has(kind)),
  );
  const newlyAddedIdentifiers = written.filter((kind) => !alreadyMatched.has(kind));

  return { ok: true, person: { recordId, action: "patched", possibleDuplicate, newlyAddedIdentifiers } };
}

export async function resolvePerson(client: AttioClient, input: PersonInput): Promise<PersonResult> {
  const queryResult = await queryPeopleWithRetry(client, input.identity);
  if (!queryResult.ok) return { ok: false, error: describeFailure(queryResult) };

  const records = queryResult.data;

  if (records.length === 0) {
    return createPerson(client, input, false);
  }

  if (records.length === 1) {
    const record = records[0];
    const matched = matchedIdentifiers(record, input.identity);
    const matchedViaSecondaryOnly = !matched.has("email") && (matched.has("telegram") || matched.has("phone"));
    const conflictsOnEmail = matchedViaSecondaryOnly && input.identity.email !== undefined;

    if (conflictsOnEmail) {
      // KTD3: a different email on a secondary-identifier match means a
      // different human - do not append a stranger's address to this record.
      return createPerson(client, input, true);
    }

    return patchPerson(client, record.id.record_id, input, undefined, matched, false);
  }

  // Multiple matches: select by KTD2 precedence, and never write an
  // identifier that belongs to one of the *other* matched records onto the
  // selected one.
  const ranked = records
    .map((record) => ({ record, matched: matchedIdentifiers(record, input.identity) }))
    .sort((a, b) => precedenceRank(a.matched) - precedenceRank(b.matched));
  const selected = ranked[0];

  const claimedByOthers = new Set<MatchKeyKind>();
  for (const { record, matched } of ranked) {
    if (record === selected.record) continue;
    for (const kind of matched) claimedByOthers.add(kind);
  }

  const restrictTo = new Set<MatchKeyKind>(
    IDENTIFIER_KINDS.filter((kind) => input.identity[kind] !== undefined && !claimedByOthers.has(kind)),
  );

  return patchPerson(client, selected.record.id.record_id, input, restrictTo, selected.matched, true);
}
