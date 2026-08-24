import { describe, it, expect } from "vitest";
import { parseContactChannels, parseRpcLead, isValidationError, isHoneypotTripped } from "./lead";
import { HONEYPOT_FIELD } from "../src/lib/leadFields";

describe("parseContactChannels", () => {
  it("accepts a minimal valid submission", () => {
    const result = parseContactChannels({ email: "ada@example.com", message: "hello" });
    expect(isValidationError(result)).toBe(false);
  });

  it("trims and truncates fields to their documented lengths rather than rejecting them", () => {
    const result = parseContactChannels({
      name: "  " + "a".repeat(150) + "  ",
      email: "ada@example.com",
      message: "x".repeat(2500),
    });
    expect(isValidationError(result)).toBe(false);
    if (!isValidationError(result)) {
      expect(result.name).toHaveLength(100);
      expect(result.message).toHaveLength(2000);
    }
  });

  it("rejects a submission with no message", () => {
    const result = parseContactChannels({ email: "ada@example.com", message: "" });
    expect(isValidationError(result)).toBe(true);
  });

  it("rejects a submission with no contact channel", () => {
    const result = parseContactChannels({ message: "hi" });
    expect(isValidationError(result)).toBe(true);
  });

  it("accepts a telegram-only submission with no email", () => {
    const result = parseContactChannels({ telegram: "@ada", message: "hi" });
    expect(isValidationError(result)).toBe(false);
  });

  it("accepts a phone-only submission with no email", () => {
    const result = parseContactChannels({ phone: "07777 777777", message: "hi" });
    expect(isValidationError(result)).toBe(false);
  });

  it("rejects an email over 255 characters rather than truncating it", () => {
    const longEmail = `${"a".repeat(250)}@b.com`; // valid shape, over the limit
    const result = parseContactChannels({ email: longEmail, message: "hi" });
    expect(isValidationError(result)).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = parseContactChannels({ email: "not-an-email", message: "hi" });
    expect(isValidationError(result)).toBe(true);
  });

  it("still accepts a submission whose only unnormalizable field is the phone", () => {
    // Covers AE4: validation accepts it - the Attio sync gate (R5) is what
    // later excludes leads with no normalizable identifier, not validation.
    const result = parseContactChannels({ phone: "07777 777777", message: "hi" });
    expect(isValidationError(result)).toBe(false);
  });
});

describe("parseRpcLead", () => {
  it("extends the shared channels with project, tier and volume", () => {
    const result = parseRpcLead({
      email: "ada@example.com",
      message: "hi",
      project: "Mini-app",
      tier: "Starter",
      volume: "100 RPS",
    });
    expect(isValidationError(result)).toBe(false);
    if (!isValidationError(result)) {
      expect(result.project).toBe("Mini-app");
      expect(result.tier).toBe("Starter");
      expect(result.volume).toBe("100 RPS");
    }
  });

  it("propagates the same channel validation errors as parseContactChannels", () => {
    const result = parseRpcLead({ message: "hi" });
    expect(isValidationError(result)).toBe(true);
  });

  it("truncates project/tier/volume to their documented lengths", () => {
    const result = parseRpcLead({
      email: "ada@example.com",
      message: "hi",
      project: "p".repeat(200),
      tier: "t".repeat(200),
      volume: "v".repeat(200),
    });
    expect(isValidationError(result)).toBe(false);
    if (!isValidationError(result)) {
      expect(result.project).toHaveLength(120);
      expect(result.tier).toHaveLength(80);
      expect(result.volume).toHaveLength(120);
    }
  });
});

describe("isHoneypotTripped", () => {
  it("trips when the hidden field carries content", () => {
    expect(isHoneypotTripped({ message: "hi", [HONEYPOT_FIELD]: "http://spam.example" })).toBe(true);
  });

  it("does not trip on a normal submission that omits the field entirely", () => {
    expect(isHoneypotTripped({ email: "ada@example.com", message: "hello" })).toBe(false);
  });

  it("does not trip on an empty string, which is what the real forms always send", () => {
    expect(isHoneypotTripped({ message: "hi", [HONEYPOT_FIELD]: "" })).toBe(false);
  });

  it("does not trip on whitespace alone", () => {
    expect(isHoneypotTripped({ message: "hi", [HONEYPOT_FIELD]: "   " })).toBe(false);
  });

  it("does not trip on a non-string value, rather than coercing it", () => {
    expect(isHoneypotTripped({ message: "hi", [HONEYPOT_FIELD]: 0 })).toBe(false);
    expect(isHoneypotTripped({ message: "hi", [HONEYPOT_FIELD]: null })).toBe(false);
  });

  it("does not throw on a non-object body", () => {
    expect(isHoneypotTripped(null)).toBe(false);
    expect(isHoneypotTripped("not an object")).toBe(false);
    expect(isHoneypotTripped(undefined)).toBe(false);
  });
});
