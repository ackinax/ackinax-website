/**
 * Schema constants shared between scripts/attio-setup.ts (which creates
 * these in the live workspace) and the Worker's sync code (which writes
 * against them). One source, so a typo can't silently blank a Deal's
 * Sub-Type while unit tests sharing the same typo still pass.
 */

import { TIER_OPTIONS } from "../../src/lib/tiers";

/** The AckiNax stage ladder (KD6), mirrored into the Deals `stage` status attribute. */
export const STAGE_LADDER = [
  "New Lead",
  "Qualifying",
  "Technical Evaluation",
  "Commercial Discussion",
  "Contract",
  "Won",
  "Lost",
] as const;

export type Stage = (typeof STAGE_LADDER)[number];

export const FIRST_STAGE: Stage = STAGE_LADDER[0];

/** "Open" per R6: any stage other than Won or Lost. */
export const CLOSED_STAGES: readonly Stage[] = ["Won", "Lost"];

export function isOpenStage(stage: string): boolean {
  return !CLOSED_STAGES.includes(stage as Stage);
}

/**
 * Sub-Type options (KD5): the site's RPC tiers, excluding "Not sure yet" -
 * that choice intentionally leaves Sub-Type blank for manual triage (AE6).
 * Derived from TIER_OPTIONS rather than retyped, so a future tier change
 * can't drift the two lists apart.
 */
export const SUB_TYPE_OPTIONS = TIER_OPTIONS.filter((tier) => tier !== "Not sure yet");

export type SubType = (typeof SUB_TYPE_OPTIONS)[number];

/** Maps a submitted tier string onto a known Sub-Type, or undefined for "Not sure yet" / anything unrecognized (KTD7). */
export function subTypeForTier(tier: string | undefined): SubType | undefined {
  return SUB_TYPE_OPTIONS.find((option) => option === tier);
}

export const LEAD_SOURCE_OPTIONS = ["RPC endpoint", "Contact form"] as const;

export type LeadSource = (typeof LEAD_SOURCE_OPTIONS)[number];

/**
 * Deal-owner workspace-member reference (A3), resolved by running
 * scripts/attio-setup.ts against the live workspace and recorded in
 * Docs/runbooks/attio-workspace-setup.md. The AckiNax workspace has a
 * single member, confirming A3's single-owner assumption.
 */
export const DEAL_OWNER_EMAIL = "frank@syks.co";
