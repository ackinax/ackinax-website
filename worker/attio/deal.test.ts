import { describe, it, expect, vi } from "vitest";
import { resolveDealAndAttachNote, type DealInput } from "./deal";
import type { AttioClient, AttioResult } from "./client";
import type { NormalizedIdentity } from "../identity";
import { DEAL_OWNER_EMAIL } from "./schema";

function fakeClient(): AttioClient & { post: ReturnType<typeof vi.fn> } {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  } as AttioClient & { post: ReturnType<typeof vi.fn> };
}

function ok<T>(data: T): AttioResult<T> {
  return { ok: true, data };
}

function fail(status = 500, message = "server error"): AttioResult<never> {
  return { ok: false, status, message };
}

function dealRecord(id: string, stageTitle: string) {
  return { id: { record_id: id }, values: { stage: [{ status: { title: stageTitle } }] } };
}

const baseIdentity: NormalizedIdentity = { email: "frank@example.com" };

function baseInput(overrides: Partial<DealInput> = {}): DealInput {
  return {
    personRecordId: "person-1",
    personName: "Frank",
    source: "RPC endpoint",
    message: "Bot getting blocked by Cloudflare.",
    identity: baseIdentity,
    ...overrides,
  };
}

describe("resolveDealAndAttachNote", () => {
  it("covers AE1: no open Deal creates one with stage, owner, Person association, lead source and Sub-Type", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/records/query")) return ok([]);
      if (path === "/v2/objects/deals/records") return ok({ id: { record_id: "deal-1" } });
      if (path === "/v2/notes") return ok({ id: { note_id: "note-1" } });
      throw new Error(`unexpected path ${path}`);
    });

    const result = await resolveDealAndAttachNote(client, baseInput({ tier: "Starter · shared endpoint" }));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.deal.action).toBe("created");

    const createCall = client.post.mock.calls.find(([path]) => path === "/v2/objects/deals/records");
    expect(createCall).toBeDefined();
    const body = createCall![1] as { data: { values: Record<string, unknown> } };
    expect(body.data.values.stage).toBe("New Lead");
    expect(body.data.values.owner).toBe(DEAL_OWNER_EMAIL);
    expect(body.data.values.associated_people).toEqual([{ target_record_id: "person-1", target_object: "people" }]);
    expect(body.data.values.lead_source).toBe("RPC endpoint");
    expect(body.data.values.ackinax_sub_type).toBe("Starter · shared endpoint");
  });

  it("sets only the Deal side of the association", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/records/query")) return ok([]);
      if (path === "/v2/objects/deals/records") return ok({ id: { record_id: "deal-1" } });
      return ok({ id: { note_id: "note-1" } });
    });

    await resolveDealAndAttachNote(client, baseInput());

    const createCall = client.post.mock.calls.find(([path]) => path === "/v2/objects/deals/records");
    const body = createCall![1] as { data: { values: Record<string, unknown> } };
    expect(Object.keys(body.data.values)).not.toContain("associated_deals");
  });

  it("covers AE2: an existing open Deal produces no create and one Note against it", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/records/query")) return ok([dealRecord("existing-deal", "Qualifying")]);
      if (path === "/v2/notes") return ok({ id: { note_id: "note-1" } });
      throw new Error(`unexpected create for path ${path}`);
    });

    const result = await resolveDealAndAttachNote(client, baseInput());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.deal.action).toBe("reused");
      expect(result.deal.dealRecordId).toBe("existing-deal");
    }
    expect(client.post).not.toHaveBeenCalledWith("/v2/objects/deals/records", expect.anything());

    const noteCall = client.post.mock.calls.find(([path]) => path === "/v2/notes");
    expect(noteCall).toBeDefined();
    const noteBody = noteCall![1] as { data: { parent_record_id: string } };
    expect(noteBody.data.parent_record_id).toBe("existing-deal");
  });

  it("opens a new Deal when the Person's only Deals are Won or Lost", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/records/query")) return ok([dealRecord("won-deal", "Won"), dealRecord("lost-deal", "Lost")]);
      if (path === "/v2/objects/deals/records") return ok({ id: { record_id: "new-deal" } });
      return ok({ id: { note_id: "note-1" } });
    });

    const result = await resolveDealAndAttachNote(client, baseInput());

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.deal.action).toBe("created");
  });

  describe("covers AE6: Sub-Type mapping", () => {
    const cases: Array<[string | undefined, string | undefined]> = [
      ["Starter · shared endpoint", "Starter · shared endpoint"],
      ["Commercial · dedicated endpoint", "Commercial · dedicated endpoint"],
      ["Dedicated / Managed · fully managed", "Dedicated / Managed · fully managed"],
      ["Managed Block Manager hosting", "Managed Block Manager hosting"],
      ["Not sure yet", undefined],
      ["something a bot submitted", undefined],
      [undefined, undefined],
    ];

    for (const [tier, expectedSubType] of cases) {
      it(`tier "${tier}" -> Sub-Type "${expectedSubType}"`, async () => {
        const client = fakeClient();
        client.post.mockImplementation(async (path: string) => {
          if (path.endsWith("/records/query")) return ok([]);
          if (path === "/v2/objects/deals/records") return ok({ id: { record_id: "deal-1" } });
          return ok({ id: { note_id: "note-1" } });
        });

        await resolveDealAndAttachNote(client, baseInput({ tier }));

        const createCall = client.post.mock.calls.find(([path]) => path === "/v2/objects/deals/records");
        const body = createCall![1] as { data: { values: Record<string, unknown> } };
        expect(body.data.values.ackinax_sub_type).toBe(expectedSubType);
      });
    }

    it("a contact-form lead (no tier field at all) yields no Sub-Type", async () => {
      const client = fakeClient();
      client.post.mockImplementation(async (path: string) => {
        if (path.endsWith("/records/query")) return ok([]);
        if (path === "/v2/objects/deals/records") return ok({ id: { record_id: "deal-1" } });
        return ok({ id: { note_id: "note-1" } });
      });

      await resolveDealAndAttachNote(client, baseInput({ source: "Contact form", tier: undefined }));

      const createCall = client.post.mock.calls.find(([path]) => path === "/v2/objects/deals/records");
      const body = createCall![1] as { data: { values: Record<string, unknown> } };
      expect(body.data.values.ackinax_sub_type).toBeUndefined();
    });
  });

  it("the Note body carries the enquiry text, expected volume, and a rejected phone", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/records/query")) return ok([]);
      if (path === "/v2/objects/deals/records") return ok({ id: { record_id: "deal-1" } });
      return ok({ id: { note_id: "note-1" } });
    });

    await resolveDealAndAttachNote(
      client,
      baseInput({ message: "Please help with X", volume: "100 RPS", rawPhone: "07777 777777" }),
    );

    const noteCall = client.post.mock.calls.find(([path]) => path === "/v2/notes");
    const body = noteCall![1] as { data: { content: string } };
    expect(body.data.content).toContain("Please help with X");
    expect(body.data.content).toContain("100 RPS");
    expect(body.data.content).toContain("07777 777777");
  });

  it("covers R7: a 'Not sure yet' RPC lead has a blank Sub-Type but a Note with the tier and channels", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/records/query")) return ok([]);
      if (path === "/v2/objects/deals/records") return ok({ id: { record_id: "deal-1" } });
      return ok({ id: { note_id: "note-1" } });
    });

    await resolveDealAndAttachNote(
      client,
      baseInput({ tier: "Not sure yet", identity: { email: "frank@example.com", telegram: "msiimsii" } }),
    );

    const createCall = client.post.mock.calls.find(([path]) => path === "/v2/objects/deals/records");
    const createBody = createCall![1] as { data: { values: Record<string, unknown> } };
    expect(createBody.data.values.ackinax_sub_type).toBeUndefined();

    const noteCall = client.post.mock.calls.find(([path]) => path === "/v2/notes");
    const noteBody = noteCall![1] as { data: { content: string } };
    expect(noteBody.data.content).toContain("Not sure yet");
    expect(noteBody.data.content).toContain("email, telegram");
  });

  it("stores markdown link syntax verbatim rather than rendering it, as plaintext", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/records/query")) return ok([]);
      if (path === "/v2/objects/deals/records") return ok({ id: { record_id: "deal-1" } });
      return ok({ id: { note_id: "note-1" } });
    });

    await resolveDealAndAttachNote(client, baseInput({ message: "Check [this link](https://evil.example.com)" }));

    const noteCall = client.post.mock.calls.find(([path]) => path === "/v2/notes");
    const body = noteCall![1] as { data: { format: string; content: string } };
    expect(body.data.format).toBe("plaintext");
    expect(body.data.content).toContain("[this link](https://evil.example.com)");
  });

  it("stops without creating a Deal or a Note when the Deal query fails twice", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/records/query")) return fail(500);
      throw new Error(`unexpected call to ${path}`);
    });

    const result = await resolveDealAndAttachNote(client, baseInput());

    expect(result.ok).toBe(false);
    expect(client.post).toHaveBeenCalledTimes(2); // query, retried once - no create, no note
  });

  it("retries a failed Deal query once before giving up", async () => {
    const client = fakeClient();
    let queryCalls = 0;
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/records/query")) {
        queryCalls += 1;
        return queryCalls === 1 ? fail(500) : ok([]);
      }
      return ok({ id: { record_id: "deal-1" } });
    });

    const result = await resolveDealAndAttachNote(client, baseInput());

    expect(result.ok).toBe(true);
    expect(queryCalls).toBe(2);
  });

  it("resolves to failure when the Deal create fails, and posts no Note", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/records/query")) return ok([]);
      if (path === "/v2/objects/deals/records") return fail(500, "create failed");
      throw new Error(`unexpected call to ${path}`);
    });

    const result = await resolveDealAndAttachNote(client, baseInput());

    expect(result.ok).toBe(false);
    expect(client.post).not.toHaveBeenCalledWith("/v2/notes", expect.anything());
  });

  it("resolves to failure when the Note attach fails, even though the Deal was created", async () => {
    const client = fakeClient();
    client.post.mockImplementation(async (path: string) => {
      if (path.endsWith("/records/query")) return ok([]);
      if (path === "/v2/objects/deals/records") return ok({ id: { record_id: "deal-1" } });
      if (path === "/v2/notes") return fail(500, "note failed");
      throw new Error(`unexpected call to ${path}`);
    });

    const result = await resolveDealAndAttachNote(client, baseInput());

    expect(result.ok).toBe(false);
  });

  describe("findOpenDeal fails closed on an unreadable stage", () => {
    const cases: Array<[string, unknown]> = [
      ["missing values.stage entirely", { id: { record_id: "deal-1" }, values: {} }],
      ["an empty stage array", { id: { record_id: "deal-1" }, values: { stage: [] } }],
      ["a malformed status shape", { id: { record_id: "deal-1" }, values: { stage: [{ status: {} }] } }],
      ["an unrecognized stage title", dealRecord("deal-1", "Some Future Stage")],
    ];

    for (const [description, malformedRecord] of cases) {
      it(`treats ${description} as not-open, and opens a new Deal instead`, async () => {
        const client = fakeClient();
        client.post.mockImplementation(async (path: string) => {
          if (path.endsWith("/records/query")) return ok([malformedRecord]);
          if (path === "/v2/objects/deals/records") return ok({ id: { record_id: "new-deal" } });
          return ok({ id: { note_id: "note-1" } });
        });

        const result = await resolveDealAndAttachNote(client, baseInput());

        expect(result.ok).toBe(true);
        if (result.ok) expect(result.deal.action).toBe("created");
      });
    }
  });
});
