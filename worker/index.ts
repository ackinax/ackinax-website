/**
 * Cloudflare Worker entry. Serves the built SPA through the ASSETS binding and
 * handles the site's form endpoints:
 *
 *   POST /api/rpc-lead  (source: RPC endpoint)
 *   POST /api/contact   (source: Contact form)
 *
 * Both post to a single Slack Incoming Webhook (SLACK_WEBHOOK_URL); each message
 * carries a Source line so one channel can tell them apart. The URL stays
 * server-side (Worker secret); when unset the routes return 503 so forms fall
 * back to email. Routing is configured in wrangler.jsonc via
 * `run_worker_first: ["/api/*"]`, so asset and SPA routes never hit this script.
 *
 * Both routes also carry a honeypot (src/components/HoneypotField.tsx): a
 * tripped one still posts to Slack and still answers success, but never
 * reaches Attio. Slack is transient and easy to ignore; an Attio record is
 * permanent and its planted identifiers cannot be told apart from real ones.
 */

import {
  parseRpcLead,
  parseContactChannels,
  isValidationError,
  isHoneypotTripped,
  type RpcLead,
  type ContactMessage,
} from "./lead";
import { evaluateSyncGate, runSync, type RawLeadFields, type SyncGateResult } from "./attio/sync";
import { DEAL_OWNER_EMAIL, type LeadSource } from "./attio/schema";
import { RATE_WINDOW_MS } from "./constants";

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  SLACK_WEBHOOK_URL?: string;
  ATTIO_API_KEY?: string;
}

// Best-effort, per-isolate rate limit — a soft guard against casual abuse.
const RATE_LIMIT = 6;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > RATE_LIMIT;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function postToSlack(webhook: string, payload: unknown): Promise<boolean> {
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5_000),
    });
    return res.ok;
  } catch {
    // A network failure or timeout must resolve to false, not throw - this
    // call sits on the request path before scheduleSync, and an unhandled
    // rejection here would lose the lead from both Slack and the CRM sync.
    return false;
  }
}

/** Shared guard for the form routes: POST only, rate-limited, webhook configured. */
function precheck(request: Request, webhook: string | undefined, key: string): Response | null {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (rateLimited(`${key}:${ip}`)) return json({ error: "Too many requests — try again in a minute." }, 429);
  if (!webhook) return json({ error: "This form is not configured." }, 503);
  return null;
}

function buildRpcLeadMessage(lead: RpcLead, crmStatusMarker?: string) {
  const who = lead.name || lead.email || lead.telegram || lead.phone || "New lead";
  const sender = lead.project ? `${who} · ${lead.project}` : who;
  const facts = [
    lead.email ? `*Email:* ${lead.email}` : null,
    lead.telegram ? `*Telegram:* ${lead.telegram}` : null,
    lead.phone ? `*Phone:* ${lead.phone}` : null,
    lead.tier ? `*Tier:* ${lead.tier}` : null,
    lead.volume ? `*Expected volume:* ${lead.volume}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const contextSuffix = crmStatusMarker ? `  ·  ${crmStatusMarker}` : "";

  return {
    text: `New RPC lead — ${sender}`,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `🛰️ *New RPC endpoint lead*\n${lead.message}` } },
      { type: "section", text: { type: "mrkdwn", text: facts } },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `From: ${sender}  ·  Source: RPC endpoint (\`/rpc\`)${contextSuffix}` }],
      },
    ],
  };
}

function buildContactMessage(c: ContactMessage, crmStatusMarker?: string) {
  const who = c.name || c.email || c.telegram || c.phone || "Someone";
  const channels = [
    c.email ? `*Email:* ${c.email}` : null,
    c.telegram ? `*Telegram:* ${c.telegram}` : null,
    c.phone ? `*Phone:* ${c.phone}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const contextSuffix = crmStatusMarker ? `  ·  ${crmStatusMarker}` : "";

  return {
    text: `Contact message — ${who}`,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `✉️ *New contact message*\n${c.message}` } },
      { type: "section", text: { type: "mrkdwn", text: channels } },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `From: ${who}  ·  Source: Contact form (\`/contact\`)${contextSuffix}` }],
      },
    ],
  };
}

/** Shared by both handlers: gate already evaluated, schedule the background sync if it should run. */
function scheduleSync(
  env: Env,
  ctx: ExecutionContext,
  lead: RawLeadFields,
  source: LeadSource,
  gate: SyncGateResult,
  slackOk: boolean,
): void {
  if (!gate.shouldSync) return;
  ctx.waitUntil(
    runSync({
      apiKey: env.ATTIO_API_KEY!,
      slackWebhookUrl: env.SLACK_WEBHOOK_URL!,
      postToSlack,
      suppressFailureNotice: !slackOk,
      lead,
      identity: gate.identity,
      source,
    }),
  );
}

async function handleRpcLead(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const blocked = precheck(request, env.SLACK_WEBHOOK_URL, "rpc-lead");
  if (blocked) return blocked;

  let body: Partial<RpcLead>;
  try {
    body = (await request.json()) as Partial<RpcLead>;
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const lead = parseRpcLead(body);
  if (isValidationError(lead)) return json({ error: lead.error }, lead.status);

  const gate = evaluateSyncGate(env.ATTIO_API_KEY, DEAL_OWNER_EMAIL, lead, isHoneypotTripped(body));
  const ok = await postToSlack(env.SLACK_WEBHOOK_URL!, buildRpcLeadMessage(lead, gate.statusMarker));
  scheduleSync(env, ctx, lead, "RPC endpoint", gate, ok);

  return ok ? json({ success: true }) : json({ error: "Failed to deliver lead" }, 502);
}

async function handleContact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const blocked = precheck(request, env.SLACK_WEBHOOK_URL, "contact");
  if (blocked) return blocked;

  let body: Partial<ContactMessage>;
  try {
    body = (await request.json()) as Partial<ContactMessage>;
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const contact = parseContactChannels(body);
  if (isValidationError(contact)) return json({ error: contact.error }, contact.status);

  const gate = evaluateSyncGate(env.ATTIO_API_KEY, DEAL_OWNER_EMAIL, contact, isHoneypotTripped(body));
  const ok = await postToSlack(env.SLACK_WEBHOOK_URL!, buildContactMessage(contact, gate.statusMarker));
  scheduleSync(env, ctx, contact, "Contact form", gate, ok);

  return ok ? json({ success: true }) : json({ error: "Failed to deliver message" }, 502);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/rpc-lead") return handleRpcLead(request, env, ctx);
    if (url.pathname === "/api/contact") return handleContact(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
