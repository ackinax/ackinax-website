import { describe, it, expect } from "vitest";
import { rpcLeadSchema, TIER_OPTIONS } from "@/lib/rpcLead";

describe("rpcLeadSchema", () => {
  const valid = { name: "Ada", email: "ada@example.com", message: "Bot getting blocked by Cloudflare." };

  it("accepts a minimal valid lead", () => {
    expect(rpcLeadSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional project, tier and volume", () => {
    const result = rpcLeadSchema.safeParse({
      ...valid,
      project: "Mini-app",
      tier: TIER_OPTIONS[0],
      volume: "150 RPS",
    });
    expect(result.success).toBe(true);
  });

  it("requires a name", () => {
    expect(rpcLeadSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(rpcLeadSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("requires a use-case message", () => {
    expect(rpcLeadSchema.safeParse({ ...valid, message: "" }).success).toBe(false);
  });

  it("rejects an over-long message", () => {
    expect(rpcLeadSchema.safeParse({ ...valid, message: "x".repeat(2001) }).success).toBe(false);
  });

  it("trims surrounding whitespace", () => {
    const parsed = rpcLeadSchema.parse({ ...valid, name: "  Ada  " });
    expect(parsed.name).toBe("Ada");
  });
});
