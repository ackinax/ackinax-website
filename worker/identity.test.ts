import { describe, it, expect } from "vitest";
import { normalizeEmail, normalizePhone, normalizeTelegram, normalizeIdentity, chooseMatchKey } from "./identity";

describe("normalizeEmail", () => {
  it("trims and lowercases the whole address", () => {
    expect(normalizeEmail("  Frank@Example.COM  ")).toBe("frank@example.com");
  });

  it("preserves plus-addressing", () => {
    expect(normalizeEmail("Frank+rpc@Example.COM")).toBe("frank+rpc@example.com");
  });

  it("preserves dots in the local part", () => {
    expect(normalizeEmail("f.rank@example.com")).toBe("f.rank@example.com");
  });

  it("still keys a role address", () => {
    expect(normalizeEmail("info@acme.com")).toBe("info@acme.com");
  });

  it("returns undefined for empty or whitespace-only input", () => {
    expect(normalizeEmail("")).toBeUndefined();
    expect(normalizeEmail("   ")).toBeUndefined();
    expect(normalizeEmail(undefined)).toBeUndefined();
  });
});

describe("normalizePhone", () => {
  it("normalizes a spaced international number to E.164", () => {
    expect(normalizePhone("+41 79 123 45 67")).toBe("+41791234567");
  });

  it("normalizes the phone from the observed duplicate-lead case", () => {
    expect(normalizePhone("+353899747961")).toBe("+353899747961");
  });

  it("rejects a national number with no leading +", () => {
    expect(normalizePhone("07777 777777")).toBeUndefined();
  });

  it("rejects another bare national number", () => {
    expect(normalizePhone("0612345678")).toBeUndefined();
  });

  it("returns undefined for empty or whitespace-only input", () => {
    expect(normalizePhone("")).toBeUndefined();
    expect(normalizePhone("   ")).toBeUndefined();
    expect(normalizePhone(undefined)).toBeUndefined();
  });

  it("never throws on garbage input", () => {
    expect(() => normalizePhone("not a phone number at all")).not.toThrow();
    expect(normalizePhone("not a phone number at all")).toBeUndefined();
  });
});

describe("normalizeTelegram", () => {
  it("strips a leading @ and accepts a handle at the 5-character minimum", () => {
    expect(normalizeTelegram("@Frank")).toBe("frank");
  });

  it("normalizes a valid handle with a leading @", () => {
    expect(normalizeTelegram("@msiimsii")).toBe("msiimsii");
  });

  it("strips a t.me/ prefix", () => {
    expect(normalizeTelegram("t.me/frank1")).toBe("frank1");
  });

  it("strips an https://t.me/ prefix and trailing slash", () => {
    expect(normalizeTelegram("https://t.me/frank1/")).toBe("frank1");
  });

  it("lowercases the handle", () => {
    expect(normalizeTelegram("FRANK1")).toBe("frank1");
  });

  it("rejects a handle under the 5-character minimum", () => {
    expect(normalizeTelegram("abcd")).toBeUndefined();
  });

  it("rejects a handle containing a space", () => {
    expect(normalizeTelegram("fra nk")).toBeUndefined();
  });

  it("returns undefined for empty or whitespace-only input", () => {
    expect(normalizeTelegram("")).toBeUndefined();
    expect(normalizeTelegram("   ")).toBeUndefined();
    expect(normalizeTelegram(undefined)).toBeUndefined();
  });
});

describe("normalizeIdentity + chooseMatchKey", () => {
  it("keys on email when all three channels are present (AE1)", () => {
    const identity = normalizeIdentity({
      email: "Frank+rpc@Example.COM",
      telegram: "@msiimsii",
      phone: "+353899747961",
    });
    expect(identity).toEqual({
      email: "frank+rpc@example.com",
      telegram: "msiimsii",
      phone: "+353899747961",
    });
    expect(chooseMatchKey(identity)).toEqual({ kind: "email", value: "frank+rpc@example.com" });
  });

  it("keys on telegram when email is absent", () => {
    const identity = normalizeIdentity({ telegram: "@msiimsii", phone: "+353899747961" });
    expect(chooseMatchKey(identity)).toEqual({ kind: "telegram", value: "msiimsii" });
  });

  it("keys on phone when only a valid phone is present", () => {
    const identity = normalizeIdentity({ phone: "+353899747961" });
    expect(chooseMatchKey(identity)).toEqual({ kind: "phone", value: "+353899747961" });
  });

  it("yields no key when only an unnormalizable phone is present (AE4)", () => {
    const identity = normalizeIdentity({ phone: "07777 777777" });
    expect(identity.phone).toBeUndefined();
    expect(chooseMatchKey(identity)).toBeUndefined();
  });

  it("yields no key when every field is empty", () => {
    expect(chooseMatchKey(normalizeIdentity({}))).toBeUndefined();
  });
});
