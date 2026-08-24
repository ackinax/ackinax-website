import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  evaluateSyncGate,
  runSync,
  __resetFailureThrottleForTests,
  type RawLeadFields,
  type RunSyncOptions,
} from "./sync";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function baseLead(overrides: Partial<RawLeadFields> = {}): RawLeadFields {
  return { email: "frank@example.com", message: "hello", ...overrides };
}

function baseOptions(overrides: Partial<RunSyncOptions> = {}): RunSyncOptions {
  return {
    apiKey: "secret-key",
    slackWebhookUrl: "https://hooks.slack.test/webhook",
    postToSlack: vi.fn().mockResolvedValue(true),
    suppressFailureNotice: false,
    lead: baseLead(),
    identity: { email: "frank@example.com" },
    source: "RPC endpoint",
    ...overrides,
  };
}

/** A fetchImpl that answers Attio's query/create/note calls with success. */
function happyPathFetch(): ReturnType<typeof vi.fn> {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/records/query")) return jsonResponse(200, { data: [] });
    if (url.includes("/records"))
      return jsonResponse(200, { data: { id: { record_id: "some-record" } } });
    if (url.includes("/notes"))
      return jsonResponse(200, { data: { id: { note_id: "note-1" } } });
    throw new Error(`unexpected Attio call to ${url}`);
  });
}

beforeEach(() => {
  __resetFailureThrottleForTests();
});

describe("evaluateSyncGate", () => {
  it("skips with a status marker when the API key is unset", () => {
    const gate = evaluateSyncGate(undefined, "owner@example.com", baseLead(), false);
    expect(gate.shouldSync).toBe(false);
    expect(gate.statusMarker).toBe("CRM: skipped - no key");
  });

  it("skips with a distinct status marker when the deal owner is unset (the shipped state)", () => {
    const gate = evaluateSyncGate("secret-key", "", baseLead(), false);
    expect(gate.shouldSync).toBe(false);
    expect(gate.statusMarker).toBe("CRM: skipped - no deal owner");
  });

  it("covers AE4: skips with a status marker when the lead has no normalizable identifier", () => {
    const gate = evaluateSyncGate(
      "secret-key",
      "owner@example.com",
      { phone: "07777 777777", message: "hi" },
      false,
    );
    expect(gate.shouldSync).toBe(false);
    expect(gate.statusMarker).toBe("CRM: skipped - no match key");
  });

  it("proceeds when a key is present and the lead has a match key", () => {
    const gate = evaluateSyncGate("secret-key", "owner@example.com", baseLead(), false);
    expect(gate.shouldSync).toBe(true);
    expect(gate.statusMarker).toBeUndefined();
  });

  it("skips with a honeypot marker when the hidden field was filled", () => {
    const gate = evaluateSyncGate("secret-key", "owner@example.com", baseLead(), true);
    expect(gate.shouldSync).toBe(false);
    expect(gate.statusMarker).toBe("CRM: skipped - honeypot");
  });

  it("reports the honeypot ahead of a missing key, so the marker names the real reason", () => {
    const gate = evaluateSyncGate(undefined, "", baseLead(), true);
    expect(gate.statusMarker).toBe("CRM: skipped - honeypot");
  });
});

describe("runSync", () => {
  it("covers AE5: every Attio call failing posts a failure notice and never throws", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(500, { message: "server error" }));
    const postToSlack = vi.fn().mockResolvedValue(true);

    await expect(
      runSync(baseOptions({ fetchImpl, postToSlack })),
    ).resolves.toBeUndefined();

    expect(postToSlack).toHaveBeenCalledTimes(1);
    const [, payload] = postToSlack.mock.calls[0] as [string, { text: string }];
    expect(payload.text).toContain("not synced");
  });

  it("posts no Slack line on a fully quiet success", async () => {
    const postToSlack = vi.fn().mockResolvedValue(true);
    await runSync(baseOptions({ fetchImpl: happyPathFetch(), postToSlack }));
    expect(postToSlack).not.toHaveBeenCalled();
  });

  it("throttles the diagnostic detail but always identifies the lead on repeated failures", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(500, { message: "server error" }));
    const postToSlack = vi.fn().mockResolvedValue(true);

    await runSync(
      baseOptions({
        fetchImpl,
        postToSlack,
        lead: baseLead({ email: "first@example.com" }),
        identity: { email: "first@example.com" },
      }),
    );
    await runSync(
      baseOptions({
        fetchImpl,
        postToSlack,
        lead: baseLead({ email: "second@example.com" }),
        identity: { email: "second@example.com" },
      }),
    );

    expect(postToSlack).toHaveBeenCalledTimes(2);
    const [, firstPayload] = postToSlack.mock.calls[0] as [
      string,
      { text: string },
    ];
    const [, secondPayload] = postToSlack.mock.calls[1] as [
      string,
      { text: string },
    ];

    expect(firstPayload.text).toContain("not synced: first@example.com");
    expect(firstPayload.text).toContain("Step:"); // first failure carries detail

    expect(secondPayload.text).toContain("not synced: second@example.com");
    expect(secondPayload.text).not.toContain("Step:"); // second failure, same window - detail throttled
  });

  it("does not consume the throttle window when the notify post itself failed to land", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(500, { message: "server error" }));
    // The first notify attempt fails to reach Slack - false, not thrown.
    const postToSlack = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    await runSync(
      baseOptions({
        fetchImpl,
        postToSlack,
        lead: baseLead({ email: "first@example.com" }),
        identity: { email: "first@example.com" },
      }),
    );
    await runSync(
      baseOptions({
        fetchImpl,
        postToSlack,
        lead: baseLead({ email: "second@example.com" }),
        identity: { email: "second@example.com" },
      }),
    );

    // Since the first notify never actually landed, the window should not be
    // considered consumed - the second failure still gets full detail.
    const [, secondPayload] = postToSlack.mock.calls[1] as [string, { text: string }];
    expect(secondPayload.text).toContain("Step:");
  });

  it("names the Deal step when the Person write succeeded but the Deal step failed", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/records/query") && url.includes("people"))
        return jsonResponse(200, { data: [] });
      if (url === "https://api.attio.com/v2/objects/people/records")
        return jsonResponse(200, { data: { id: { record_id: "person-1" } } });
      if (url.includes("/records/query") && url.includes("deals"))
        return jsonResponse(500, { message: "deal query failed" });
      throw new Error(`unexpected call to ${url}`);
    });
    const postToSlack = vi.fn().mockResolvedValue(true);

    await runSync(baseOptions({ fetchImpl, postToSlack }));

    const [, payload] = postToSlack.mock.calls[0] as [string, { text: string }];
    expect(payload.text).toContain("Step: Deal");
    // The Person write already landed - "not synced" would wrongly suggest
    // nothing happened and risk a duplicate Person on manual re-entry.
    expect(payload.text).toContain("CRM partially synced");
    expect(payload.text).not.toContain("not synced");
  });

  it("uses the plain 'not synced' wording when the Person step itself failed (nothing was written)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(500, { message: "server error" }));
    const postToSlack = vi.fn().mockResolvedValue(true);

    await runSync(baseOptions({ fetchImpl, postToSlack }));

    const [, payload] = postToSlack.mock.calls[0] as [string, { text: string }];
    expect(payload.text).toContain("not synced");
    expect(payload.text).not.toContain("partially synced");
  });

  it("stops the sequence at the first failed step - no Deal call after a Person failure", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("people"))
        return jsonResponse(500, { message: "person query failed" });
      throw new Error(
        `unexpected Deal-object call to ${url} after a Person failure`,
      );
    });

    await runSync(
      baseOptions({ fetchImpl, postToSlack: vi.fn().mockResolvedValue(true) }),
    );
    // The thrown error above would fail the test if a Deal-object call happened.
  });

  it("posts exactly one line when the sync succeeds but flags a possible duplicate", async () => {
    // The record already has a DIFFERENT email on file - a genuine conflict,
    // not just "matched via phone and this submission happens to have an email".
    const existingByPhone = {
      id: { record_id: "phone-owner" },
      values: {
        phone_numbers: [{ phone_number: "+353899747961" }],
        email_addresses: [{ email_address: "someone-else@example.com" }],
      },
    };
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("people/records/query"))
        return jsonResponse(200, { data: [existingByPhone] });
      if (url === "https://api.attio.com/v2/objects/people/records")
        return jsonResponse(200, { data: { id: { record_id: "new-person" } } });
      if (url.includes("deals/records/query"))
        return jsonResponse(200, { data: [] });
      if (url === "https://api.attio.com/v2/objects/deals/records")
        return jsonResponse(200, { data: { id: { record_id: "deal-1" } } });
      if (url.includes("/notes"))
        return jsonResponse(200, { data: { id: { note_id: "note-1" } } });
      throw new Error(`unexpected call to ${url}`);
    });
    const postToSlack = vi.fn().mockResolvedValue(true);

    await runSync(
      baseOptions({
        fetchImpl,
        postToSlack,
        identity: { email: "frank@example.com", phone: "+353899747961" },
      }),
    );

    expect(postToSlack).toHaveBeenCalledTimes(1);
    const [, payload] = postToSlack.mock.calls[0] as [string, { text: string }];
    expect(payload.text).toContain("possible duplicate");
  });

  it("posts a line naming the identifier added to a pre-existing Person", async () => {
    const existingByEmail = {
      id: { record_id: "existing-person" },
      values: { email_addresses: [{ email_address: "frank@example.com" }] },
    };
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("people/records/query"))
        return jsonResponse(200, { data: [existingByEmail] });
      if (url.includes("people/records/"))
        return jsonResponse(200, {
          data: { id: { record_id: "existing-person" } },
        }); // PATCH
      if (url.includes("deals/records/query"))
        return jsonResponse(200, { data: [] });
      if (url === "https://api.attio.com/v2/objects/deals/records")
        return jsonResponse(200, { data: { id: { record_id: "deal-1" } } });
      if (url.includes("/notes"))
        return jsonResponse(200, { data: { id: { note_id: "note-1" } } });
      throw new Error(`unexpected call to ${url}`);
    });
    const postToSlack = vi.fn().mockResolvedValue(true);

    await runSync(
      baseOptions({
        fetchImpl,
        postToSlack,
        identity: { email: "frank@example.com", telegram: "msiimsii" },
      }),
    );

    const [, payload] = postToSlack.mock.calls[0] as [string, { text: string }];
    expect(payload.text).toContain("added telegram");
  });

  it("suppresses the failure notice when the initial Slack lead post already failed", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(500, { message: "server error" }));
    const postToSlack = vi.fn().mockResolvedValue(true);

    await runSync(
      baseOptions({ fetchImpl, postToSlack, suppressFailureNotice: true }),
    );

    expect(postToSlack).not.toHaveBeenCalled();
  });

  it("never rejects even when postToSlack itself throws", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(500, { message: "server error" }));
    const postToSlack = vi
      .fn()
      .mockRejectedValue(new Error("Slack is also down"));

    await expect(
      runSync(baseOptions({ fetchImpl, postToSlack })),
    ).resolves.toBeUndefined();
  });
});
