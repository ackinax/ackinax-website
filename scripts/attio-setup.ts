#!/usr/bin/env bun
/**
 * One-time (re-runnable) Attio workspace schema setup for the dedicated
 * AckiNax workspace (U3). See Docs/runbooks/attio-workspace-setup.md for
 * the manual prerequisites this script assumes are already done: the
 * Deals object enabled, a *setup* API key issued, and Attio's DPA signed.
 *
 * Usage:
 *   ATTIO_API_KEY=<setup key> bun run attio:setup
 *
 * Never run this with the Worker's *runtime* key (KTD10) - the setup key
 * needs object-configuration write, which the runtime key deliberately
 * lacks. `.dev.vars` is a Wrangler file and is not loaded by a plain bun
 * process, so the key must be passed via the environment directly.
 *
 * Idempotent by design: every create call treats a 409 conflict as
 * success, so re-running after a partial failure is safe.
 */

import { STAGE_LADDER, SUB_TYPE_OPTIONS, LEAD_SOURCE_OPTIONS, type Stage } from "../worker/attio/schema";

const API_KEY = process.env.ATTIO_API_KEY;
if (!API_KEY) {
  console.error("ATTIO_API_KEY is not set. Usage: ATTIO_API_KEY=<setup key> bun run attio:setup");
  process.exit(1);
}

const BASE_URL = "https://api.attio.com";

type AttioResponse = { ok: boolean; status: number; body: Record<string, unknown> | null };

async function attio(path: string, init: RequestInit = {}): Promise<AttioResponse> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  return { ok: res.ok, status: res.status, body };
}

function isConflict(res: AttioResponse): boolean {
  return res.status === 409 || (res.body as { code?: string } | null)?.code === "slug_conflict";
}

async function ensureAttribute(object: "people" | "deals", body: Record<string, unknown>): Promise<void> {
  const slug = body.api_slug as string;
  const res = await attio(`/v2/objects/${object}/attributes`, { method: "POST", body: JSON.stringify({ data: body }) });
  if (res.ok) {
    console.log(`  created attribute ${object}.${slug}`);
    return;
  }
  if (isConflict(res)) {
    console.log(`  attribute ${object}.${slug} already exists - skipping`);
    return;
  }
  throw new Error(`Failed to create attribute ${object}.${slug}: ${res.status} ${JSON.stringify(res.body)}`);
}

async function ensureSelectOption(object: "people" | "deals", attribute: string, title: string): Promise<void> {
  const res = await attio(`/v2/objects/${object}/attributes/${attribute}/options`, {
    method: "POST",
    body: JSON.stringify({ data: { title } }),
  });
  if (res.ok || isConflict(res)) {
    console.log(`  option "${title}" on ${object}.${attribute} ${res.ok ? "created" : "already exists"}`);
    return;
  }
  throw new Error(`Failed to create option "${title}" on ${object}.${attribute}: ${res.status} ${JSON.stringify(res.body)}`);
}

interface AttioStatus {
  id: { status_id: string };
  title: string;
  is_archived: boolean;
}

async function listStatuses(object: "people" | "deals", attribute: string): Promise<AttioStatus[]> {
  const res = await attio(`/v2/objects/${object}/attributes/${attribute}/statuses`);
  if (!res.ok) throw new Error(`Failed to list statuses for ${object}.${attribute}: ${res.status}`);
  return ((res.body as { data?: AttioStatus[] } | null)?.data ?? []) as AttioStatus[];
}

async function ensureStatus(object: "people" | "deals", attribute: string, title: string): Promise<void> {
  const res = await attio(`/v2/objects/${object}/attributes/${attribute}/statuses`, {
    method: "POST",
    body: JSON.stringify({ data: { title } }),
  });
  if (res.ok || isConflict(res)) {
    console.log(`  status "${title}" on ${object}.${attribute} ${res.ok ? "created" : "already exists"}`);
    return;
  }
  throw new Error(`Failed to create status "${title}" on ${object}.${attribute}: ${res.status} ${JSON.stringify(res.body)}`);
}

async function renameStatus(object: "people" | "deals", attribute: string, statusId: string, title: string): Promise<void> {
  const res = await attio(`/v2/objects/${object}/attributes/${attribute}/statuses/${statusId}`, {
    method: "PATCH",
    body: JSON.stringify({ data: { title } }),
  });
  if (!res.ok) throw new Error(`Failed to rename status ${statusId} to "${title}": ${res.status} ${JSON.stringify(res.body)}`);
  console.log(`  renamed status to "${title}"`);
}

async function archiveStatus(object: "people" | "deals", attribute: string, statusId: string, title: string): Promise<void> {
  const res = await attio(`/v2/objects/${object}/attributes/${attribute}/statuses/${statusId}`, {
    method: "PATCH",
    body: JSON.stringify({ data: { is_archived: true } }),
  });
  if (!res.ok) throw new Error(`Failed to archive status "${title}": ${res.status} ${JSON.stringify(res.body)}`);
  console.log(`  archived unused default status "${title}"`);
}

/** Strips emoji/punctuation and lowercases, so "Won 🎉" matches "won". */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}

/** How a fresh workspace's default Deal stages map onto the AckiNax ladder (KD6). */
const DEFAULT_TO_LADDER: Record<string, Stage> = {
  lead: "New Lead",
  "in progress": "Qualifying",
  won: "Won",
  lost: "Lost",
};

async function reportCurrentSchema(): Promise<void> {
  console.log("Current schema:");
  for (const object of ["people", "deals"] as const) {
    const res = await attio(`/v2/objects/${object}/attributes`);
    if (!res.ok) {
      console.log(`  could not read ${object} attributes: ${res.status} ${JSON.stringify(res.body)}`);
      continue;
    }
    const attributes = ((res.body as { data?: Array<Record<string, unknown>> } | null)?.data ?? []) as Array<
      Record<string, unknown>
    >;
    const summary = attributes
      .map((a) => `${a.api_slug} (${a.type}${a.is_unique ? ", unique" : ""})`)
      .join(", ");
    console.log(`  ${object}: ${summary || "(no attributes returned)"}`);
  }
}

/**
 * Empirically answers RK1 (can People carry a unique custom attribute?) and,
 * against Deals, Q3 (can Deals carry a unique text attribute?) by attempting
 * to create one and immediately archiving it. A prior run's probe attribute
 * still exists (archived), so a conflict also counts as "yes, supported".
 */
async function probeUniqueAttributeSupport(object: "people" | "deals"): Promise<boolean> {
  const probeSlug = "_probe_unique_ce_work";
  const res = await attio(`/v2/objects/${object}/attributes`, {
    method: "POST",
    body: JSON.stringify({
      data: {
        title: "CE Work Probe (safe to archive/ignore)",
        api_slug: probeSlug,
        type: "text",
        is_unique: true,
        is_required: false,
        is_multiselect: false,
      },
    }),
  });
  if (res.ok) {
    await attio(`/v2/objects/${object}/attributes/${probeSlug}`, {
      method: "PATCH",
      body: JSON.stringify({ data: { is_archived: true } }),
    });
    return true;
  }
  return isConflict(res);
}

async function reshapeStageLadder(): Promise<void> {
  console.log("Reshaping Deal stage ladder...");
  const existing = await listStatuses("deals", "stage");
  const claimed = new Set<Stage>();

  for (const status of existing) {
    if (status.is_archived) continue;

    if ((STAGE_LADDER as readonly string[]).includes(status.title)) {
      // Already a ladder-named status, likely from a prior run.
      claimed.add(status.title as Stage);
      continue;
    }

    const target = DEFAULT_TO_LADDER[normalizeTitle(status.title)];
    if (target && !claimed.has(target)) {
      await renameStatus("deals", "stage", status.id.status_id, target);
      claimed.add(target);
    } else {
      await archiveStatus("deals", "stage", status.id.status_id, status.title);
    }
  }

  for (const stage of STAGE_LADDER) {
    if (!claimed.has(stage)) {
      await ensureStatus("deals", "stage", stage);
    }
  }
}

async function ensureSubTypeAndSourceSelects(): Promise<void> {
  console.log("Creating Deal Sub-Type and Lead Source selects...");

  await ensureAttribute("deals", {
    title: "Ackinax Sub-Type",
    api_slug: "ackinax_sub_type",
    type: "select",
    is_required: false,
    is_unique: false,
    is_multiselect: false,
  });
  for (const tier of SUB_TYPE_OPTIONS) {
    await ensureSelectOption("deals", "ackinax_sub_type", tier);
  }

  await ensureAttribute("deals", {
    title: "Lead Source",
    api_slug: "lead_source",
    type: "select",
    is_required: false,
    is_unique: false,
    is_multiselect: false,
  });
  for (const source of LEAD_SOURCE_OPTIONS) {
    await ensureSelectOption("deals", "lead_source", source);
  }
}

async function ensureTelegramAttribute(): Promise<void> {
  console.log("Creating People Telegram attribute...");
  // Non-unique: RK1 - People cannot carry a unique custom attribute.
  await ensureAttribute("people", {
    title: "Telegram",
    api_slug: "telegram",
    type: "text",
    is_required: false,
    is_unique: false,
    is_multiselect: false,
  });
}

interface WorkspaceMember {
  id?: { workspace_member_id?: string };
  email_address?: string;
  first_name?: string;
  last_name?: string;
}

async function resolveOwner(): Promise<void> {
  console.log("Resolving the workspace member to own Deals (A3)...");
  const res = await attio("/v2/workspace_members");
  if (!res.ok) {
    console.log(`  could not list workspace members: ${res.status} ${JSON.stringify(res.body)}`);
    return;
  }
  const members = ((res.body as { data?: WorkspaceMember[] } | null)?.data ?? []) as WorkspaceMember[];
  if (members.length === 0) {
    console.log("  no workspace members found");
    return;
  }
  if (members.length > 1) {
    console.log(`  ${members.length} workspace members found - A3 assumed exactly one. Pick the owner manually:`);
  }
  for (const m of members) {
    const name = [m.first_name, m.last_name].filter(Boolean).join(" ");
    console.log(`  - ${m.email_address ?? m.id?.workspace_member_id ?? "(no email on record)"}${name ? ` (${name})` : ""}`);
  }
  console.log("  Set DEAL_OWNER_EMAIL in worker/attio/schema.ts to the chosen address, and record it in the runbook.");
}

async function main(): Promise<void> {
  console.log("=== Attio AckiNax workspace setup ===\n");

  await reportCurrentSchema();

  console.log("\nProbing unique-attribute support (RK1, Q3)...");
  const peopleUniqueSupported = await probeUniqueAttributeSupport("people");
  console.log(
    `  People accepts a unique custom attribute: ${peopleUniqueSupported ? "YES (unexpected - re-check RK1)" : "no (expected - RK1 confirmed)"}`,
  );
  const dealsUniqueSupported = await probeUniqueAttributeSupport("deals");
  console.log(
    `  Deals accepts a unique text attribute: ${dealsUniqueSupported ? "yes (Q3 is buildable as a follow-up)" : "NO (unexpected - re-check Q3)"}`,
  );

  console.log("");
  await reshapeStageLadder();

  console.log("");
  await ensureSubTypeAndSourceSelects();

  console.log("");
  await ensureTelegramAttribute();

  console.log("");
  await resolveOwner();

  console.log("\n=== Done. Paste this output into Docs/runbooks/attio-workspace-setup.md. ===");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
