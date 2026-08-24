/**
 * Reuses the submitter's open Deal, or opens their first one, then attaches
 * the enquiry as a Note (R6, R7, R8). The open-Deal lookup is a plain read
 * before a write - racy in principle, fine at this lead volume, and the
 * plan's actual duplicate-suppression mechanism rather than a guarantee
 * (KTD4).
 */

import { describeFailure, retryOnce, type AttioClient } from "./client";
import { FIRST_STAGE, STAGE_LADDER, isOpenStage, subTypeForTier, DEAL_OWNER_EMAIL, type LeadSource } from "./schema";
import { MATCH_KEY_KINDS, type NormalizedIdentity } from "../identity";

interface AttioDealRecord {
  id: { record_id: string };
  values: {
    stage?: Array<{ status?: { title?: string } | string }>;
  };
}

export interface DealInput {
  personRecordId: string;
  personName?: string;
  source: LeadSource;
  message: string;
  project?: string;
  /** Only present for RPC leads; absent for contact-form leads. */
  tier?: string;
  volume?: string;
  identity: NormalizedIdentity;
  /** The original, unnormalized phone text, when normalization rejected it. */
  rawPhone?: string;
}

export interface DealOutcome {
  dealRecordId: string;
  action: "created" | "reused";
}

export type DealResult = { ok: true; deal: DealOutcome } | { ok: false; error: string };

function extractStageTitle(record: AttioDealRecord): string | undefined {
  const raw = record.values.stage?.[0]?.status;
  if (!raw) return undefined;
  return typeof raw === "string" ? raw : raw.title;
}

async function queryDealsForPersonOnce(client: AttioClient, personRecordId: string) {
  // Filtering server-side to open stages only would need a status $or/$not
  // filter whose exact semantics this plan could not verify from an
  // authoritative source (see the plan's Sources). Filtering client-side
  // against the small set of deals a person actually has is simpler and
  // avoids depending on that unverified behavior.
  return client.post<AttioDealRecord[]>("/v2/objects/deals/records/query", {
    filter: { associated_people: { target_object: "people", target_record_id: personRecordId } },
    limit: 25,
  });
}

function findOpenDeal(records: AttioDealRecord[]): AttioDealRecord | undefined {
  return records.find((record) => {
    const title = extractStageTitle(record);
    // An unrecognized or missing stage title must not default to "open" -
    // that would silently reuse a Deal whose real stage we couldn't read,
    // which could be Won or Lost. Fail closed: treat it as no match, so a
    // new Deal is created instead (visible and recoverable).
    return title !== undefined && (STAGE_LADDER as readonly string[]).includes(title) && isOpenStage(title);
  });
}

/**
 * Mirrors the Slack lead message's sender fallback in worker/index.ts rather
 * than dropping straight to "New lead". A submission with no name still
 * carries an identifier worth showing, and this title is written once at
 * creation - a later submission from the same person that does supply a name
 * appends a Note to the existing Deal and never rewrites the title, so
 * "New lead" would otherwise stick permanently. Identifiers come from the
 * normalized identity, so the title matches what was actually stored.
 */
function buildDealName(input: DealInput): string {
  const who =
    input.personName ||
    input.identity.email ||
    input.identity.telegram ||
    input.identity.phone ||
    "New lead";
  const context = input.project || input.source;
  return `${who} · ${context}`;
}

async function createDeal(client: AttioClient, input: DealInput): Promise<DealResult> {
  const values: Record<string, unknown> = {
    name: buildDealName(input),
    stage: FIRST_STAGE,
    owner: DEAL_OWNER_EMAIL,
    // Write only the Deal side of the relationship (per the plan) - Attio
    // maintains the inverse `associated_deals` on the Person automatically.
    associated_people: [{ target_record_id: input.personRecordId, target_object: "people" }],
    lead_source: input.source,
  };

  const subType = subTypeForTier(input.tier);
  if (subType) values.ackinax_sub_type = subType;

  const result = await client.post<{ id: { record_id: string } }>("/v2/objects/deals/records", { data: { values } });
  if (!result.ok) return { ok: false, error: describeFailure(result) };
  return { ok: true, deal: { dealRecordId: result.data.id.record_id, action: "created" } };
}

function buildNoteContent(input: DealInput): string {
  const channels = MATCH_KEY_KINDS.filter((kind) => input.identity[kind]);

  const lines: Array<string | undefined> = [
    input.message,
    "",
    input.project ? `Project: ${input.project}` : undefined,
    input.tier ? `Tier: ${input.tier}` : undefined,
    input.volume ? `Expected volume: ${input.volume}` : undefined,
    `Channels supplied: ${channels.length ? channels.join(", ") : "none"}`,
    input.rawPhone ? `Phone (unnormalized): ${input.rawPhone}` : undefined,
    `Source: ${input.source}`,
  ];

  return lines.filter((line): line is string => line !== undefined).join("\n");
}

async function attachNote(client: AttioClient, dealRecordId: string, input: DealInput): Promise<{ ok: true } | { ok: false; error: string }> {
  // format: "plaintext" - the body is up to 2000 characters of unauthenticated
  // submitted text; rendering it as markdown would put attacker-supplied
  // links into a CRM view staff read and click. Never retried (KTD4) - Notes
  // are never deduplicated by Attio, so a retry would create a duplicate.
  const result = await client.post("/v2/notes", {
    data: {
      parent_object: "deals",
      parent_record_id: dealRecordId,
      title: `New enquiry - ${input.source}`,
      format: "plaintext",
      content: buildNoteContent(input),
    },
  });
  if (!result.ok) return { ok: false, error: describeFailure(result) };
  return { ok: true };
}

export async function resolveDealAndAttachNote(client: AttioClient, input: DealInput): Promise<DealResult> {
  const queryResult = await retryOnce(() => queryDealsForPersonOnce(client, input.personRecordId));
  if (!queryResult.ok) return { ok: false, error: describeFailure(queryResult) };

  const openDeal = findOpenDeal(queryResult.data);
  const dealResult: DealResult = openDeal
    ? { ok: true, deal: { dealRecordId: openDeal.id.record_id, action: "reused" } }
    : await createDeal(client, input);

  if (!dealResult.ok) return dealResult;

  const noteResult = await attachNote(client, dealResult.deal.dealRecordId, input);
  if (!noteResult.ok) return { ok: false, error: noteResult.error };

  return dealResult;
}
