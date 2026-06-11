import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RpcLeadRequest {
  name: string;
  email: string;
  project?: string;
  tier?: string;
  volume?: string;
  message: string;
}

// Best-effort, per-isolate rate limit. Not distributed — a soft guard against
// casual abuse, mirroring the lightweight limiter used elsewhere in the org.
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

function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Build the Slack Incoming Webhook payload for an RPC lead. */
function buildSlackMessage(lead: RpcLeadRequest) {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (rateLimited(`rpc-lead:${clientIp(req)}`)) {
    return new Response(JSON.stringify({ error: "Too many requests — try again in a minute." }), {
      status: 429,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const webhook = Deno.env.get("SLACK_RPC_WEBHOOK_URL");
  if (!webhook) {
    return new Response(JSON.stringify({ error: "Lead capture is not configured." }), {
      status: 503,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const body: RpcLeadRequest = await req.json();

    if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
      return new Response(JSON.stringify({ error: "Name, email and message are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const lead: RpcLeadRequest = {
      name: body.name.trim().slice(0, 100),
      email: body.email.trim().slice(0, 255),
      project: body.project?.trim().slice(0, 120),
      tier: body.tier?.trim().slice(0, 80),
      volume: body.volume?.trim().slice(0, 120),
      message: body.message.trim().slice(0, 2000),
    };

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildSlackMessage(lead)),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Slack rejected the lead:", res.status, detail);
      throw new Error("Failed to deliver lead");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("send-rpc-lead error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
