/**
 * Orchestrates person -> deal -> note in the background and owns the
 * Slack-facing failure/success signal (R1, R2, R5, R10).
 */

import { normalizeIdentity, chooseMatchKey, type NormalizedIdentity } from "../identity";
import { createAttioClient, describeError } from "./client";
import { resolvePerson, type PersonOutcome } from "./person";
import { resolveDealAndAttachNote, type DealInput } from "./deal";
import type { LeadSource } from "./schema";
import { RATE_WINDOW_MS } from "../constants";

export interface RawLeadFields {
  name?: string;
  email?: string;
  telegram?: string;
  phone?: string;
  message: string;
  project?: string;
  tier?: string;
  volume?: string;
}

export interface SyncGateResult {
  shouldSync: boolean;
  /** Appended to the Slack lead message itself - never a separate post (R5). */
  statusMarker?: string;
  identity: NormalizedIdentity;
}

/**
 * Decides whether the sync runs at all, before the Slack lead message is
 * even built - a dropped secret or a missing owner constant must not turn
 * the whole feature off with zero signal. `dealOwnerEmail` is passed in
 * (from worker/attio/schema.ts's DEAL_OWNER_EMAIL at the call site) rather
 * than imported directly, so this function stays pure and testable instead
 * of depending on module-level state that is empty until U3's live setup
 * has run.
 */
export function evaluateSyncGate(
  apiKey: string | undefined,
  dealOwnerEmail: string,
  lead: RawLeadFields,
  honeypotTripped: boolean,
): SyncGateResult {
  const identity = normalizeIdentity(lead);

  // Checked before the key and owner gates so the marker names the real
  // reason. Required rather than defaulted: this is a spam control, and a
  // caller that forgets it should fail to compile, not silently fail open.
  if (honeypotTripped) {
    return { shouldSync: false, statusMarker: "CRM: skipped - honeypot", identity };
  }
  if (!apiKey) {
    return { shouldSync: false, statusMarker: "CRM: skipped - no key", identity };
  }
  if (!dealOwnerEmail) {
    return { shouldSync: false, statusMarker: "CRM: skipped - no deal owner", identity };
  }
  if (!chooseMatchKey(identity)) {
    return { shouldSync: false, statusMarker: "CRM: skipped - no match key", identity };
  }
  return { shouldSync: true, identity };
}

export interface RunSyncOptions {
  apiKey: string;
  fetchImpl?: typeof fetch;
  slackWebhookUrl: string;
  postToSlack: (webhook: string, payload: unknown) => Promise<boolean>;
  /** True when the initial Slack lead post itself failed - the failure notice would target the same dead webhook. */
  suppressFailureNotice: boolean;
  lead: RawLeadFields;
  identity: NormalizedIdentity;
  source: LeadSource;
}

// Failure-notice detail throttle: per-isolate, best-effort, sharing the
// window worker/index.ts's rate limiter uses. Every failure still posts an
// identifying line - only the diagnostic detail is throttled, so manual
// re-entry from Slack stays possible for every failed lead.
let lastDetailedFailureAt = 0;

/** Test-only escape hatch for the module-level throttle state. */
export function __resetFailureThrottleForTests(): void {
  lastDetailedFailureAt = 0;
}

function identifyLead(lead: RawLeadFields, identity: NormalizedIdentity): string {
  return lead.name || identity.email || identity.telegram || identity.phone || "unknown lead";
}

async function notifyFailure(
  options: RunSyncOptions,
  step: string,
  error: string,
  contactCreated: boolean,
): Promise<void> {
  if (options.suppressFailureNotice) return;

  const now = Date.now();
  const includeDetail = now - lastDetailedFailureAt >= RATE_WINDOW_MS;

  const identifier = identifyLead(options.lead, options.identity);
  // "not synced" is only accurate when nothing was written at all - when the
  // Person already landed and only the Deal/Note step failed, re-entering
  // from this notice as if from scratch would duplicate that Person.
  const headline = contactCreated
    ? `⚠️ CRM partially synced - contact created but Deal/Note failed: ${identifier}`
    : `⚠️ CRM sync failed - not synced: ${identifier}`;
  const text = includeDetail ? `${headline}\nStep: ${step}\n${error}` : headline;

  // Never notify about a failed notification - swallow and stop. Only
  // advance the throttle window once the post is confirmed to have landed,
  // so a notify that itself failed doesn't consume the next lead's detail.
  const posted = await options.postToSlack(options.slackWebhookUrl, { text }).catch(() => false);
  if (includeDetail && posted) lastDetailedFailureAt = now;
}

async function notifySuccessIfNoteworthy(options: RunSyncOptions, person: PersonOutcome): Promise<void> {
  const identifier = identifyLead(options.lead, options.identity);
  const lines: string[] = [];

  if (person.possibleDuplicate) {
    lines.push(`possible duplicate contact for ${identifier} - please check Attio`);
  }
  if (person.newlyAddedIdentifiers.length > 0) {
    lines.push(`added ${person.newlyAddedIdentifiers.join(", ")} to an existing contact (${identifier})`);
  }

  if (lines.length === 0) return;

  await options.postToSlack(options.slackWebhookUrl, { text: `ℹ️ CRM sync: ${lines.join("; ")}` }).catch(() => {});
}

/**
 * Runs the whole sync sequence. Never rejects (KTD5) - the promise this
 * returns is handed straight to `ctx.waitUntil`, and an unhandled rejection
 * there would be cancelled with no signal.
 */
export async function runSync(options: RunSyncOptions): Promise<void> {
  try {
    const client = createAttioClient({ apiKey: options.apiKey, fetchImpl: options.fetchImpl });

    const personResult = await resolvePerson(client, { name: options.lead.name, identity: options.identity });
    if (!personResult.ok) {
      await notifyFailure(options, "Person", personResult.error, false);
      return;
    }

    const dealInput: DealInput = {
      personRecordId: personResult.person.recordId,
      personName: options.lead.name,
      source: options.source,
      message: options.lead.message,
      project: options.lead.project,
      tier: options.source === "RPC endpoint" ? options.lead.tier : undefined,
      volume: options.lead.volume,
      identity: options.identity,
      rawPhone: options.lead.phone && !options.identity.phone ? options.lead.phone : undefined,
    };

    const dealResult = await resolveDealAndAttachNote(client, dealInput);
    if (!dealResult.ok) {
      // The Person write above already landed - only the Deal/Note step failed.
      await notifyFailure(options, "Deal", dealResult.error, true);
      return;
    }

    await notifySuccessIfNoteworthy(options, personResult.person);
  } catch (err) {
    await notifyFailure(options, "unexpected", describeError(err), false);
  }
}
