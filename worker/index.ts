/**
 * Cloudflare Worker entry. Serves the built SPA through the ASSETS binding and
 * handles POST /api/rpc-lead by posting the lead to a Slack Incoming Webhook.
 *
 * The webhook URL stays server-side (Worker secret SLACK_RPC_WEBHOOK_URL). When
 * it's unset the route returns 503 so the form can fall back to email. Routing is
 * configured in wrangler.jsonc via `run_worker_first: ["/api/*"]`, so asset and
 * SPA routes never hit this script.
 */

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  SLACK_RPC_WEBHOOK_URL?: string;
}

interface RpcLead {
  name: string;
  email: string;
  project?: string;
  tier?: string;
  volume?: string;
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

/** Build the Slack Incoming Webhook payload for an RPC lead. */
function buildSlackMessage(lead: RpcLead) {
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

async function handleRpcLead(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (rateLimited(`rpc-lead:${ip}`)) {
    return json({ error: "Too many requests — try again in a minute." }, 429);
  }

  if (!env.SLACK_RPC_WEBHOOK_URL) {
    return json({ error: "Lead capture is not configured." }, 503);
  }

  let body: RpcLead;
  try {
    body = (await request.json()) as RpcLead;
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
    return json({ error: "Name, email and message are required" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return json({ error: "Invalid email" }, 400);
  }

  const lead: RpcLead = {
    name: body.name.trim().slice(0, 100),
    email: body.email.trim().slice(0, 255),
    project: body.project?.trim().slice(0, 120),
    tier: body.tier?.trim().slice(0, 80),
    volume: body.volume?.trim().slice(0, 120),
    message: body.message.trim().slice(0, 2000),
  };

  const res = await fetch(env.SLACK_RPC_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildSlackMessage(lead)),
  });
  if (!res.ok) {
    return json({ error: "Failed to deliver lead" }, 502);
  }

  return json({ success: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/rpc-lead") {
      return handleRpcLead(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
