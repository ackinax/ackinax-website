import { describe, it, expect, vi } from "vitest";
import { createAttioClient, retryOnce } from "./client";
import type { AttioResult } from "./client";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("createAttioClient", () => {
  it("resolves a 200 with a well-formed body to success with the parsed data", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { data: { id: { record_id: "abc" } } }));
    const client = createAttioClient({ apiKey: "secret-key", fetchImpl });

    const result = await client.get("/v2/objects/people/records/abc");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ id: { record_id: "abc" } });
  });

  it("resolves a 400 carrying an Attio error envelope to failure, preserving code and message", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(400, { status_code: 400, type: "invalid_request_error", code: "value_not_found", message: "No attribute was found" }));
    const client = createAttioClient({ apiKey: "secret-key", fetchImpl });

    const result = await client.post("/v2/objects/people/records", { data: {} });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.code).toBe("value_not_found");
      expect(result.message).toBe("No attribute was found");
    }
  });

  it("resolves a 429 to failure and does not retry", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(429, { code: "rate_limit_exceeded", message: "Rate limit exceeded" }));
    const client = createAttioClient({ apiKey: "secret-key", fetchImpl });

    const result = await client.post("/v2/objects/deals/records", {});

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(429);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("resolves a rejected fetch to failure rather than throwing", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("network error"));
    const client = createAttioClient({ apiKey: "secret-key", fetchImpl });

    await expect(client.get("/v2/objects/people/records/abc")).resolves.toMatchObject({ ok: false });
  });

  it("resolves an aborted fetch (timeout) to failure rather than throwing", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new DOMException("The operation was aborted", "TimeoutError"));
    const client = createAttioClient({ apiKey: "secret-key", fetchImpl });

    const result = await client.get("/v2/objects/people/records/abc");
    expect(result.ok).toBe(false);
  });

  it("truncates an oversized error body", async () => {
    const longMessage = "x".repeat(5_000);
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(400, { code: "validation_type", message: longMessage }));
    const client = createAttioClient({ apiKey: "secret-key", fetchImpl });

    const result = await client.post("/v2/objects/people/records", {});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBeDefined();
      expect(result.message!.length).toBeLessThan(300);
    }
  });

  it("sends the API key in the request header", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { data: {} }));
    const client = createAttioClient({ apiKey: "secret-key-value", fetchImpl });

    await client.get("/v2/self");

    const [, init] = fetchImpl.mock.calls[0];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer secret-key-value");
  });

  it("never includes the API key in a returned error", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("connection reset"));
    const client = createAttioClient({ apiKey: "super-secret-key", fetchImpl });

    const result = await client.get("/v2/self");

    expect(JSON.stringify(result)).not.toContain("super-secret-key");
  });

  it("applies a per-call abort signal", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { data: {} }));
    const client = createAttioClient({ apiKey: "secret-key", fetchImpl });

    await client.get("/v2/self");

    const [, init] = fetchImpl.mock.calls[0];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("retryOnce", () => {
  function failure(status: number): AttioResult<never> {
    return { ok: false, status, message: "failed" };
  }

  it("retries once on a 500 and returns the second attempt", async () => {
    const attempt = vi.fn<() => Promise<AttioResult<string>>>()
      .mockResolvedValueOnce(failure(500))
      .mockResolvedValueOnce({ ok: true, data: "second" });

    const result = await retryOnce(attempt);

    expect(attempt).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true, data: "second" });
  });

  it("retries once on a network failure (status 0)", async () => {
    const attempt = vi.fn<() => Promise<AttioResult<string>>>()
      .mockResolvedValueOnce(failure(0))
      .mockResolvedValueOnce({ ok: true, data: "second" });

    await retryOnce(attempt);

    expect(attempt).toHaveBeenCalledTimes(2);
  });

  it("retries once on a 429", async () => {
    const attempt = vi.fn<() => Promise<AttioResult<string>>>()
      .mockResolvedValueOnce(failure(429))
      .mockResolvedValueOnce({ ok: true, data: "second" });

    await retryOnce(attempt);

    expect(attempt).toHaveBeenCalledTimes(2);
  });

  it("does not retry a deterministic 400", async () => {
    const attempt = vi.fn<() => Promise<AttioResult<string>>>().mockResolvedValue(failure(400));

    const result = await retryOnce(attempt);

    expect(attempt).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);
  });

  it("does not retry a 404", async () => {
    const attempt = vi.fn<() => Promise<AttioResult<string>>>().mockResolvedValue(failure(404));

    await retryOnce(attempt);

    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it("does not retry on the first success", async () => {
    const attempt = vi.fn<() => Promise<AttioResult<string>>>().mockResolvedValue({ ok: true, data: "first" });

    await retryOnce(attempt);

    expect(attempt).toHaveBeenCalledTimes(1);
  });
});
