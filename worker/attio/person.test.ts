import { describe, it, expect, vi } from "vitest";
import { resolvePerson } from "./person";
import type { AttioClient, AttioResult } from "./client";
import type { NormalizedIdentity } from "../identity";

function fakeClient(overrides: Partial<AttioClient> = {}): AttioClient & {
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
} {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    ...overrides,
  } as AttioClient & { post: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn> };
}

function ok<T>(data: T): AttioResult<T> {
  return { ok: true, data };
}

function fail(status = 500, message = "server error"): AttioResult<never> {
  return { ok: false, status, message };
}

function record(id: string, values: { email?: string; telegram?: string; phone?: string }) {
  return {
    id: { record_id: id },
    values: {
      email_addresses: values.email ? [{ email_address: values.email }] : [],
      telegram: values.telegram ? [{ value: values.telegram }] : [],
      phone_numbers: values.phone ? [{ phone_number: values.phone }] : [],
    },
  };
}

describe("resolvePerson", () => {
  it("covers AE1: no existing match creates a Person with all three identifiers", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/query")) return ok([]);
      return ok({ id: { record_id: "new-person" } });
    });

    const identity: NormalizedIdentity = {
      email: "frank+rpc@example.com",
      telegram: "msiimsii",
      phone: "+353899747961",
    };
    const result = await resolvePerson(client, { name: "Frank", identity });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.person.action).toBe("created");
      expect(result.person.possibleDuplicate).toBe(false);
    }

    const createCall = client.post.mock.calls.find(([path]) => !path.endsWith("/query"));
    expect(createCall).toBeDefined();
    const body = createCall![1] as { data: { values: Record<string, unknown> } };
    expect(body.data.values.email_addresses).toEqual(["frank+rpc@example.com"]);
    expect(body.data.values.telegram).toBe("msiimsii");
    expect(body.data.values.phone_numbers).toEqual(["+353899747961"]);
  });

  it("covers AE2: an email-only lead matching an existing Person appends rather than replaces", async () => {
    const existing = record("existing-person", { email: "frank+rpc@example.com", telegram: "msiimsii", phone: "+353899747961" });
    const client = fakeClient();
    client.post.mockResolvedValue(ok([existing]));
    client.patch.mockResolvedValue(ok({ id: { record_id: "existing-person" } }));

    const identity: NormalizedIdentity = { email: "frank+rpc@example.com" };
    const result = await resolvePerson(client, { identity });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.person.action).toBe("patched");
      // The record already had this email - nothing genuinely new here.
      expect(result.person.newlyAddedIdentifiers).toEqual([]);
    }

    const [, body] = client.patch.mock.calls[0] as [string, { data: { values: Record<string, unknown> } }];
    expect(body.data.values.email_addresses).toEqual(["frank+rpc@example.com"]);
    // The request must not carry a phone_numbers array at all - PATCH appends,
    // but sending an array the submission didn't provide would still be wrong.
    expect(body.data.values.phone_numbers).toBeUndefined();
  });

  it("covers AE3: a Telegram-only lead with no match creates a Person keyed on the handle", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/query")) return ok([]);
      return ok({ id: { record_id: "new-person" } });
    });

    const identity: NormalizedIdentity = { telegram: "msiimsii" };
    const result = await resolvePerson(client, { identity });

    expect(result.ok).toBe(true);
    const createCall = client.post.mock.calls.find(([path]) => !path.endsWith("/query"));
    const body = createCall![1] as { data: { values: Record<string, unknown> } };
    expect(body.data.values.telegram).toBe("msiimsii");
    expect(body.data.values.email_addresses).toBeUndefined();
  });

  it("never sends a phone field when the submission's phone failed normalization", async () => {
    // A failed-normalization phone is simply absent from NormalizedIdentity -
    // this test documents that the resolver never reintroduces it.
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/query")) return ok([]);
      return ok({ id: { record_id: "new-person" } });
    });

    const identity: NormalizedIdentity = { email: "a@b.com" }; // phone omitted - as if normalization failed
    await resolvePerson(client, { identity });

    const createCall = client.post.mock.calls.find(([path]) => !path.endsWith("/query"));
    const body = createCall![1] as { data: { values: Record<string, unknown> } };
    expect(body.data.values.phone_numbers).toBeUndefined();
  });

  it("covers KTD3: a phone match with a conflicting email creates a new Person and flags it", async () => {
    const existing = record("phone-owner", { email: "someone-else@example.com", phone: "+353899747961" });
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/query")) return ok([existing]);
      return ok({ id: { record_id: "new-person" } });
    });

    const identity: NormalizedIdentity = { email: "frank@example.com", phone: "+353899747961" };
    const result = await resolvePerson(client, { identity });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.person.action).toBe("created");
      expect(result.person.possibleDuplicate).toBe(true);
    }
    expect(client.patch).not.toHaveBeenCalled();
  });

  it("does not treat a telegram-only match as a conflict when the submission has no email", async () => {
    const existing = record("telegram-owner", { telegram: "msiimsii" });
    const client = fakeClient();
    client.post.mockResolvedValue(ok([existing]));
    client.patch.mockResolvedValue(ok({ id: { record_id: "telegram-owner" } }));

    const identity: NormalizedIdentity = { telegram: "msiimsii" };
    const result = await resolvePerson(client, { identity });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.person.action).toBe("patched");
      expect(result.person.possibleDuplicate).toBe(false);
    }
  });

  it("selects the email-matched record over the phone-matched one, writes once, and flags the ambiguity", async () => {
    const emailOwner = record("email-owner", { email: "frank@example.com" });
    const phoneOwner = record("phone-owner", { phone: "+353899747961" });
    const client = fakeClient();
    client.post.mockResolvedValue(ok([phoneOwner, emailOwner])); // deliberately out of precedence order
    client.patch.mockResolvedValue(ok({ id: { record_id: "email-owner" } }));

    const identity: NormalizedIdentity = { email: "frank@example.com", phone: "+353899747961" };
    const result = await resolvePerson(client, { identity });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.person.recordId).toBe("email-owner");
      expect(result.person.action).toBe("patched");
      expect(result.person.possibleDuplicate).toBe(true);
      // The email was already on the selected record - not a new identifier.
      expect(result.person.newlyAddedIdentifiers).toEqual([]);
    }
    expect(client.patch).toHaveBeenCalledTimes(1);

    const [path, body] = client.patch.mock.calls[0] as [string, { data: { values: Record<string, unknown> } }];
    expect(path).toContain("email-owner");
    expect(body.data.values.email_addresses).toEqual(["frank@example.com"]);
    // The phone belongs to the OTHER matched record - must not be written onto this one.
    expect(body.data.values.phone_numbers).toBeUndefined();
  });

  it("retries a failed query once, and fails without writing after a second failure", async () => {
    const client = fakeClient();
    client.post.mockResolvedValueOnce(fail(500)).mockResolvedValueOnce(fail(500));

    const identity: NormalizedIdentity = { email: "a@b.com" };
    const result = await resolvePerson(client, { identity });

    expect(result.ok).toBe(false);
    expect(client.post).toHaveBeenCalledTimes(2); // query, retried once
    expect(client.patch).not.toHaveBeenCalled();
  });

  it("succeeds on the retried query after the first attempt fails", async () => {
    const client = fakeClient();
    let queryCalls = 0;
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/query")) {
        queryCalls += 1;
        return queryCalls === 1 ? fail(500) : ok([]);
      }
      return ok({ id: { record_id: "new-person" } });
    });

    const identity: NormalizedIdentity = { email: "a@b.com" };
    const result = await resolvePerson(client, { identity });

    expect(result.ok).toBe(true);
    expect(queryCalls).toBe(2);
  });

  it("reports a genuinely new identifier added to a pre-existing Person (RK6)", async () => {
    // The record is only known by email so far; this submission also supplies
    // a Telegram handle that record has never seen before.
    const existing = record("existing-person", { email: "frank@example.com" });
    const client = fakeClient();
    client.post.mockResolvedValue(ok([existing]));
    client.patch.mockResolvedValue(ok({ id: { record_id: "existing-person" } }));

    const identity: NormalizedIdentity = { email: "frank@example.com", telegram: "msiimsii" };
    const result = await resolvePerson(client, { identity });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.person.action).toBe("patched");
      expect(result.person.newlyAddedIdentifiers).toEqual(["telegram"]);
    }
  });

  it("a created Person always reports no newly-added identifiers - there is no pre-existing record to enrich", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/query")) return ok([]);
      return ok({ id: { record_id: "new-person" } });
    });

    const identity: NormalizedIdentity = { email: "a@b.com", telegram: "msiimsii" };
    const result = await resolvePerson(client, { identity });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.person.newlyAddedIdentifiers).toEqual([]);
  });

  it("never includes IP or user-agent fields in a request body", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/query")) return ok([]);
      return ok({ id: { record_id: "new-person" } });
    });

    const identity: NormalizedIdentity = { email: "a@b.com", telegram: "msiimsii", phone: "+353899747961" };
    await resolvePerson(client, { name: "Frank", identity });

    for (const call of client.post.mock.calls) {
      const serialized = JSON.stringify(call[1]);
      expect(serialized.toLowerCase()).not.toContain("ip");
      expect(serialized.toLowerCase()).not.toContain("user_agent");
      expect(serialized.toLowerCase()).not.toContain("useragent");
    }
  });
});
