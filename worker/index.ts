/**
 * Cloudflare Worker entry. Serves the built SPA through the ASSETS binding and
 * handles the site's form endpoints by posting to Slack Incoming Webhooks:
 *
 *   POST /api/rpc-lead  → SLACK_RPC_WEBHOOK_URL
 *   POST /api/contact   → SLACK_CONTACT_WEBHOOK_URL
 *
 * Webhook URLs stay server-side (Worker secrets). When one is unset its route
 * returns 503 so the form can fall back to email. Routing is configured in
 * wrangler.jsonc via `run_worker_first: ["/api/*"]`, so asset and SPA routes
 * never hit this script.
 */

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  SLACK_RPC_WEBHOOK_URL?: string;
  SLACK_CONTACT_WEBHOOK_URL?: string;
}

interface RpcLead {
  name: string;
  email: string;
  project?: string;
  tier?: string;
  volume?: string;
  message: string;
}

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Best-effort, per-isolate rate limit — a soft guard against casual abuse.
const RATE_LIMIT = 6;
const RATE_WINDOW_MS = 60_000;
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function postToSlack(webhook: string, payload: unknown): Promise<boolean> {
  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

/** Shared guard for the form routes: POST only, rate-limited, webhook configured. */
function precheck(request: Request, webhook: string | undefined, key: string): Response | null {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (rateLimited(`${key}:${ip}`)) return json({ error: "Too many requests — try again in a minute." }, 429);
  if (!webhook) return json({ error: "This form is not configured." }, 503);
  return null;
}

function buildRpcLeadMessage(lead: RpcLead) {
  const sender = lead.project?.trim() ? `${lead.name} · ${lead.project.trim()}` : lead.name;
  const facts = [
    lead.tier?.trim() ? `*Tier:* ${lead.tier.trim()}` : null,
    lead.volume?.trim() ? `*Expected volume:* ${lead.volume.trim()}` : null,
    `*Email:* ${lead.email}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    text: `New RPC lead — ${sender}`,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `🛰️ *New RPC endpoint lead*\n${lead.message}` } },
      { type: "section", text: { type: "mrkdwn", text: facts } },
      { type: "context", elements: [{ type: "mrkdwn", text: `From: ${sender}` }] },
    ],
  };
}

function buildContactMessage(c: ContactMessage) {
  return {
    text: `Contact message — ${c.name}`,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `✉️ *${c.subject}*\n${c.message}` } },
      { type: "context", elements: [{ type: "mrkdwn", text: `From: ${c.name} <${c.email}>` }] },
    ],
  };
}

async function handleRpcLead(request: Request, env: Env): Promise<Response> {
  const blocked = precheck(request, env.SLACK_RPC_WEBHOOK_URL, "rpc-lead");
  if (blocked) return blocked;

  let body: RpcLead;
  try {
    body = (await request.json()) as RpcLead;
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
    return json({ error: "Name, email and message are required" }, 400);
  }
  if (!EMAIL_RE.test(body.email.trim())) return json({ error: "Invalid email" }, 400);

  const lead: RpcLead = {
    name: body.name.trim().slice(0, 100),
    email: body.email.trim().slice(0, 255),
    project: body.project?.trim().slice(0, 120),
    tier: body.tier?.trim().slice(0, 80),
    volume: body.volume?.trim().slice(0, 120),
    message: body.message.trim().slice(0, 2000),
  };

  const ok = await postToSlack(env.SLACK_RPC_WEBHOOK_URL!, buildRpcLeadMessage(lead));
  return ok ? json({ success: true }) : json({ error: "Failed to deliver lead" }, 502);
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  const blocked = precheck(request, env.SLACK_CONTACT_WEBHOOK_URL, "contact");
  if (blocked) return blocked;

  let body: ContactMessage;
  try {
    body = (await request.json()) as ContactMessage;
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!body.name?.trim() || !body.email?.trim() || !body.subject?.trim() || !body.message?.trim()) {
    return json({ error: "All fields are required" }, 400);
  }
  if (!EMAIL_RE.test(body.email.trim())) return json({ error: "Invalid email" }, 400);

  const contact: ContactMessage = {
    name: body.name.trim().slice(0, 100),
    email: body.email.trim().slice(0, 255),
    subject: body.subject.trim().slice(0, 200),
    message: body.message.trim().slice(0, 2000),
  };

  const ok = await postToSlack(env.SLACK_CONTACT_WEBHOOK_URL!, buildContactMessage(contact));
  return ok ? json({ success: true }) : json({ error: "Failed to deliver message" }, 502);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/rpc-lead") return handleRpcLead(request, env);
    if (url.pathname === "/api/contact") return handleContact(request, env);
    return env.ASSETS.fetch(request);
  },
};
