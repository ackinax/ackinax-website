/**
 * Resolves a submission's identity to exactly one Attio Person, enriching
 * rather than overwriting (R3, R4). Query-then-write, not upsert (KTD1):
 * Attio's upsert only accepts a unique matching attribute (email is the
 * only one People has), and its documented semantics replace every OTHER
 * multiselect value in the payload - sending a partial phone array there
 * would delete phones a prior submission recorded.
 */

import { describeFailure, retryOnce, type AttioClient } from "./client";
import { MATCH_KEY_KINDS, type MatchKeyKind, type NormalizedIdentity } from "../identity";

interface AttioPersonRecord {
  id: { record_id: string };
  values: {
    name?: Array<{ full_name?: string }>;
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

function storedEmails(record: AttioPersonRecord): string[] {
  return (record.values.email_addresses ?? [])
    .map((e) => e.email_address?.toLowerCase())
    .filter((e): e is string => Boolean(e));
}

function storedTelegram(record: AttioPersonRecord): string | undefined {
  return record.values.telegram?.[0]?.value?.toLowerCase();
}

function storedName(record: AttioPersonRecord): string | undefined {
  return record.values.name?.[0]?.full_name;
}

/** Which of the submission's identifiers this record's stored values already carry. */
function matchedIdentifiers(record: AttioPersonRecord, identity: NormalizedIdentity): Set<MatchKeyKind> {
  const matched = new Set<MatchKeyKind>();

  if (identity.email && storedEmails(record).includes(identity.email)) matched.add("email");
  if (identity.telegram && storedTelegram(record) === identity.telegram) matched.add("telegram");

  const phones = (record.values.phone_numbers ?? []).map((p) => p.phone_number);
  if (identity.phone && phones.includes(identity.phone)) matched.add("phone");

  return matched;
}

/**
 * A record only *conflicts* on email when it already stores a different one -
 * a secondary-identifier match against a record with no email on file yet is
 * not a conflict, it's the submission's first time providing one (KTD3).
 */
function hasConflictingEmail(record: AttioPersonRecord, identity: NormalizedIdentity): boolean {
  if (!identity.email) return false;
  const emails = storedEmails(record);
  return emails.length > 0 && !emails.includes(identity.email);
}

/** KTD2, via MATCH_KEY_KINDS: email outranks Telegram outranks phone. */
function precedenceRank(matched: Set<MatchKeyKind>): number {
  const index = MATCH_KEY_KINDS.findIndex((kind) => matched.has(kind));
  return index === -1 ? MATCH_KEY_KINDS.length : index;
}

/**
 * `existing` is only present when patching a matched record. name and
 * telegram are single-value Attio attributes - a PATCH *replaces* them
 * rather than appending, unlike the multiselect email/phone arrays - so
 * both are only written when the record doesn't already have a different
 * value on file. Writing them unconditionally would silently overwrite an
 * established contact's name or handle (R4).
 */
function buildValues(
  name: string | undefined,
  identity: NormalizedIdentity,
  restrictTo: Set<MatchKeyKind> | undefined,
  existing?: { name?: string; telegram?: string },
) {
  const values: Record<string, unknown> = {};
  const include = (kind: MatchKeyKind) => !restrictTo || restrictTo.has(kind);

  if (name && !existing?.name) values.name = { full_name: name };
  if (identity.email && include("email")) values.email_addresses = [identity.email];
  if (identity.telegram && include("telegram") && (!existing?.telegram || existing.telegram === identity.telegram)) {
    values.telegram = identity.telegram;
  }
  // A phone that failed normalization is already absent from `identity` - KTD8's
  // "never send a malformed phone" falls out of building from normalized identity.
  if (identity.phone && include("phone")) values.phone_numbers = [identity.phone];

  return values;
}

async function createPerson(client: AttioClient, input: PersonInput, possibleDuplicate: boolean): Promise<PersonResult> {
  const values = buildValues(input.name, input.identity, undefined);
  const result = await client.post<{ id: { record_id: string } }>("/v2/objects/people/records", { data: { values } });
  if (!result.ok) return { ok: false, error: describeFailure(result) };
  return {
    ok: true,
    person: { recordId: result.data.id.record_id, action: "created", possibleDuplicate, newlyAddedIdentifiers: [] },
  };
}

async function patchPerson(
  client: AttioClient,
  record: AttioPersonRecord,
  input: PersonInput,
  restrictTo: Set<MatchKeyKind> | undefined,
  alreadyMatched: Set<MatchKeyKind>,
  possibleDuplicate: boolean,
): Promise<PersonResult> {
  const existing = { name: storedName(record), telegram: storedTelegram(record) };
  const values = buildValues(input.name, input.identity, restrictTo, existing);
  const result = await client.patch<{ id: { record_id: string } }>(`/v2/objects/people/records/${record.id.record_id}`, {
    data: { values },
  });
  if (!result.ok) return { ok: false, error: describeFailure(result) };

  const written = MATCH_KEY_KINDS.filter(
    (kind) => input.identity[kind] !== undefined && (!restrictTo || restrictTo.has(kind)),
  );
  const newlyAddedIdentifiers = written.filter((kind) => !alreadyMatched.has(kind));

  return { ok: true, person: { recordId: record.id.record_id, action: "patched", possibleDuplicate, newlyAddedIdentifiers } };
}

export async function resolvePerson(client: AttioClient, input: PersonInput): Promise<PersonResult> {
  const queryResult = await retryOnce(() => queryPeopleOnce(client, input.identity));
  if (!queryResult.ok) return { ok: false, error: describeFailure(queryResult) };

  const records = queryResult.data;

  if (records.length === 0) {
    return createPerson(client, input, false);
  }

  if (records.length === 1) {
    const record = records[0];

    if (hasConflictingEmail(record, input.identity)) {
      // KTD3: the record already has a *different* email on file - a
      // different human - do not append a stranger's address to this record.
      return createPerson(client, input, true);
    }

    const matched = matchedIdentifiers(record, input.identity);
    return patchPerson(client, record, input, undefined, matched, false);
  }

  // Multiple matches: select by KTD2 precedence, and never write an
  // identifier that belongs to one of the *other* matched records onto the
  // selected one.
  const ranked = records
    .map((record) => ({ record, matched: matchedIdentifiers(record, input.identity) }))
    .sort((a, b) => precedenceRank(a.matched) - precedenceRank(b.matched));
  const selected = ranked[0];

  if (hasConflictingEmail(selected.record, input.identity)) {
    // Same rule as the single-match case: the highest-precedence candidate
    // already carries a different email, so it belongs to a different human.
    return createPerson(client, input, true);
  }

  const claimedByOthers = new Set<MatchKeyKind>();
  for (const { record, matched } of ranked) {
    if (record === selected.record) continue;
    for (const kind of matched) claimedByOthers.add(kind);
  }

  const restrictTo = new Set<MatchKeyKind>(
    MATCH_KEY_KINDS.filter((kind) => input.identity[kind] !== undefined && !claimedByOthers.has(kind)),
  );

  return patchPerson(client, selected.record, input, restrictTo, selected.matched, true);
}
