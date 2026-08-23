import { describe, it, expect, vi, beforeEach } from "vitest";

// worker/attio/deal.ts also reads DEAL_OWNER_EMAIL from this module, so this
// mock covers both the gate check in index.ts and the Deal-create payload.
vi.mock("./attio/schema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./attio/schema")>();
  return { ...actual, DEAL_OWNER_EMAIL: "owner@example.com" };
});

import worker from "./index";
import { __resetFailureThrottleForTests } from "./attio/sync";

interface FakeCtx extends ExecutionContext {
  waitUntilPromises: Promise<unknown>[];
}

function fakeCtx(): FakeCtx {
  const waitUntilPromises: Promise<unknown>[] = [];
  return {
    waitUntilPromises,
    waitUntil(promise: Promise<unknown>) {
      waitUntilPromises.push(promise);
    },
    passThroughOnException() {},
  } as unknown as FakeCtx;
}

function fakeEnv(overrides: Partial<{ SLACK_WEBHOOK_URL?: string; ATTIO_API_KEY?: string }> = {}) {
  return {
    ASSETS: { fetch: vi.fn() },
    SLACK_WEBHOOK_URL: "https://hooks.slack.test/webhook",
    ATTIO_API_KEY: "secret-key",
    ...overrides,
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function rpcLeadRequest(body: unknown, ip: string): Request {
  return new Request("https://example.com/api/rpc-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(body),
  });
}

function contactRequest(body: unknown, ip: string): Request {
  return new Request("https://example.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(body),
  });
}

let slackCalls: Array<{ text: string; blocks: Array<{ elements?: Array<{ text: string }> }> }>;
let slackShouldFail: boolean;
let attioShouldFail: boolean;

function installFetchRouter() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.startsWith("https://hooks.slack.test")) {
        const payload = init?.body ? JSON.parse(init.body as string) : {};
        slackCalls.push(payload);
        return slackShouldFail ? jsonResponse(500, {}) : jsonResponse(200, { ok: true });
      }

      if (url.startsWith("https://api.attio.com")) {
        if (attioShouldFail) return jsonResponse(500, { message: "attio down" });
        if (url.endsWith("/records/query")) return jsonResponse(200, { data: [] });
        if (url === "https://api.attio.com/v2/objects/people/records") {
          return jsonResponse(200, { data: { id: { record_id: "person-1" } } });
        }
        if (url === "https://api.attio.com/v2/objects/deals/records") {
          return jsonResponse(200, { data: { id: { record_id: "deal-1" } } });
        }
        if (url === "https://api.attio.com/v2/notes") {
          return jsonResponse(200, { data: { id: { note_id: "note-1" } } });
        }
        throw new Error(`unexpected Attio URL ${url}`);
      }

      throw new Error(`unexpected fetch URL ${url}`);
    }),
  );
}

beforeEach(() => {
  __resetFailureThrottleForTests();
  slackCalls = [];
  slackShouldFail = false;
  attioShouldFail = false;
  installFetchRouter();
});

describe("POST /api/rpc-lead - Attio sync integration", () => {
  it("covers AE5: every Attio call failing still returns success and the Slack lead post is unaffected", async () => {
    attioShouldFail = true;
    const ctx = fakeCtx();

    const res = await worker.fetch(
      rpcLeadRequest({ email: "frank@example.com", message: "hello" }, "203.0.113.10"),
      fakeEnv(),
      ctx,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });

    await Promise.all(ctx.waitUntilPromises);

    expect(slackCalls[0].text).toContain("New RPC lead");
  });

  it("covers AE4: a lead with no normalizable identifier schedules no background work", async () => {
    const ctx = fakeCtx();

    const res = await worker.fetch(
      rpcLeadRequest({ phone: "07777 777777", message: "hello" }, "203.0.113.11"),
      fakeEnv(),
      ctx,
    );

    expect(res.status).toBe(200);
    expect(ctx.waitUntilPromises).toHaveLength(0);

    const marker = slackCalls[0].blocks.at(-1)?.elements?.[0]?.text;
    expect(marker).toContain("CRM: skipped - no match key");
  });

  it("schedules no background work when the API key is unset", async () => {
    const ctx = fakeCtx();

    const res = await worker.fetch(
      rpcLeadRequest({ email: "frank@example.com", message: "hello" }, "203.0.113.12"),
      fakeEnv({ ATTIO_API_KEY: undefined }),
      ctx,
    );

    expect(res.status).toBe(200);
    expect(ctx.waitUntilPromises).toHaveLength(0);

    const marker = slackCalls[0].blocks.at(-1)?.elements?.[0]?.text;
    expect(marker).toContain("CRM: skipped - no key");
  });

  it("posts no additional Slack line when the sync succeeds quietly", async () => {
    const ctx = fakeCtx();

    await worker.fetch(
      rpcLeadRequest({ email: "frank@example.com", message: "hello" }, "203.0.113.13"),
      fakeEnv(),
      ctx,
    );
    await Promise.all(ctx.waitUntilPromises);

    expect(slackCalls).toHaveLength(1); // only the lead message
  });

  it("still schedules the sync when the Slack lead post fails, and posts no Attio failure notice", async () => {
    slackShouldFail = true;
    attioShouldFail = true;
    const ctx = fakeCtx();

    const res = await worker.fetch(
      rpcLeadRequest({ email: "frank@example.com", message: "hello" }, "203.0.113.14"),
      fakeEnv(),
      ctx,
    );

    expect(res.status).toBe(502); // existing Slack-failure response path, untouched
    expect(ctx.waitUntilPromises.length).toBeGreaterThan(0); // the sync WAS scheduled

    await Promise.all(ctx.waitUntilPromises);

    // Only the (failed) lead-message attempt reached Slack - no separate failure notice.
    expect(slackCalls).toHaveLength(1);
  });

  it("still responds and still schedules the sync when the Slack fetch itself rejects (not just a bad response)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.startsWith("https://hooks.slack.test")) throw new TypeError("network error");
        if (url.startsWith("https://api.attio.com")) return jsonResponse(200, { data: [] });
        throw new Error(`unexpected fetch URL ${url}`);
      }),
    );
    const ctx = fakeCtx();

    const res = await worker.fetch(
      rpcLeadRequest({ email: "frank@example.com", message: "hello" }, "203.0.113.16"),
      fakeEnv(),
      ctx,
    );

    expect(res.status).toBe(502); // postToSlack resolves false rather than throwing
    expect(ctx.waitUntilPromises.length).toBeGreaterThan(0); // scheduleSync still ran
    await Promise.all(ctx.waitUntilPromises);
  });
});

describe("POST /api/contact - Attio sync integration", () => {
  it("syncs a contact-form lead with no tier field", async () => {
    const ctx = fakeCtx();

    const res = await worker.fetch(
      contactRequest({ telegram: "@msiimsii", message: "hi there" }, "203.0.113.15"),
      fakeEnv(),
      ctx,
    );

    expect(res.status).toBe(200);
    await Promise.all(ctx.waitUntilPromises);
    expect(slackCalls).toHaveLength(1); // quiet success, no follow-up line
  });
});

describe("existing behavior, unchanged by the Attio sync", () => {
  it("rejects a non-POST method", async () => {
    const req = new Request("https://example.com/api/rpc-lead", { method: "GET" });
    const res = await worker.fetch(req, fakeEnv(), fakeCtx());
    expect(res.status).toBe(405);
  });

  it("returns 400 for a submission with no contact method", async () => {
    const res = await worker.fetch(rpcLeadRequest({ message: "hi" }, "203.0.113.20"), fakeEnv(), fakeCtx());
    expect(res.status).toBe(400);
  });

  it("returns 503 when the Slack webhook is unconfigured", async () => {
    const res = await worker.fetch(
      rpcLeadRequest({ email: "a@b.com", message: "hi" }, "203.0.113.21"),
      fakeEnv({ SLACK_WEBHOOK_URL: undefined }),
      fakeCtx(),
    );
    expect(res.status).toBe(503);
  });

  it("serves the SPA for any other path", async () => {
    const env = fakeEnv();
    const req = new Request("https://example.com/some/page");
    await worker.fetch(req, env, fakeCtx());
    expect(env.ASSETS.fetch).toHaveBeenCalledWith(req);
  });
});
