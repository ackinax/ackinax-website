import { describe, it, expect } from "vitest";
import { STAGE_LADDER, FIRST_STAGE, isOpenStage, SUB_TYPE_OPTIONS, subTypeForTier, DEAL_OWNER_EMAIL } from "./schema";

describe("STAGE_LADDER", () => {
  it("has seven distinct stages, Won and Lost as separate statuses", () => {
    expect(STAGE_LADDER).toHaveLength(7);
    expect(STAGE_LADDER).toContain("Won");
    expect(STAGE_LADDER).toContain("Lost");
  });

  it("starts with New Lead", () => {
    expect(FIRST_STAGE).toBe("New Lead");
  });
});

describe("isOpenStage", () => {
  it("treats every stage except Won and Lost as open", () => {
    for (const stage of STAGE_LADDER) {
      const expected = stage !== "Won" && stage !== "Lost";
      expect(isOpenStage(stage)).toBe(expected);
    }
  });

  it("treats an unrecognized stage as open (conservative default)", () => {
    expect(isOpenStage("Some Future Stage")).toBe(true);
  });
});

describe("SUB_TYPE_OPTIONS", () => {
  it("excludes 'Not sure yet' (KD5)", () => {
    expect(SUB_TYPE_OPTIONS).not.toContain("Not sure yet");
  });

  it("has exactly the four confirmed tiers", () => {
    expect(SUB_TYPE_OPTIONS).toHaveLength(4);
  });
});

describe("subTypeForTier", () => {
  it("maps a recognized tier onto its Sub-Type", () => {
    expect(subTypeForTier("Starter · shared endpoint")).toBe("Starter · shared endpoint");
  });

  it("leaves 'Not sure yet' unmapped (AE6)", () => {
    expect(subTypeForTier("Not sure yet")).toBeUndefined();
  });

  it("leaves an unrecognized tier string unmapped rather than passing it through (KTD7)", () => {
    expect(subTypeForTier("some free text a bot submitted")).toBeUndefined();
  });

  it("leaves an absent tier unmapped", () => {
    expect(subTypeForTier(undefined)).toBeUndefined();
  });
});

describe("DEAL_OWNER_EMAIL", () => {
  it("is resolved to the AckiNax workspace's sole member, per scripts/attio-setup.ts", () => {
    expect(DEAL_OWNER_EMAIL).toBe("frank@syks.co");
  });
});
