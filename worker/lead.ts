/**
 * Shared shape and server-side validation for both form endpoints. Field
 * rules (limits, email pattern) come from src/lib/leadFields.ts - a
 * zero-dependency module the browser-side Zod schema also uses - so the
 * Worker stays dependency-free rather than importing Zod.
 */

import { EMAIL_RE, FIELD_LIMITS, HONEYPOT_FIELD } from "../src/lib/leadFields";

/**
 * True when the hidden honeypot field came back with content, which a human
 * filling the visible form cannot do. Checked against the raw body rather
 * than a parsed lead: the field is deliberately not part of the lead shape,
 * so it can never reach Slack, Attio or a typed attribute.
 */
export function isHoneypotTripped(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const value = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}

export interface ContactChannels {
  name?: string;
  email?: string;
  telegram?: string;
  phone?: string;
  message: string;
}

export interface RpcLead extends ContactChannels {
  project?: string;
  tier?: string;
  volume?: string;
}

export type ContactMessage = ContactChannels;

export interface ValidationError {
  error: string;
  status: number;
}

export function isValidationError<T>(result: ValidationError | T): result is ValidationError {
  return typeof result === "object" && result !== null && "error" in result && "status" in result;
}

function trimTruncate(value: string | undefined, limit: number): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, limit) : undefined;
}

/** Validates and truncates the fields every form submission shares. */
export function parseContactChannels(body: Partial<ContactChannels>): ValidationError | ContactChannels {
  if (!body.message?.trim()) return { error: "A message is required", status: 400 };

  const email = body.email?.trim();
  if (!email && !body.telegram?.trim() && !body.phone?.trim()) {
    return { error: "Provide at least one contact method", status: 400 };
  }
  // Reject rather than truncate: truncating after validation would store a
  // different string than the one EMAIL_RE approved, and that stored value
  // is also the Attio identity match key - it must be exact, not mangled.
  if (email && email.length > FIELD_LIMITS.email) return { error: "Email must be under 255 characters", status: 400 };
  if (email && !EMAIL_RE.test(email)) return { error: "Invalid email", status: 400 };

  return {
    name: trimTruncate(body.name, FIELD_LIMITS.name),
    email,
    telegram: trimTruncate(body.telegram, FIELD_LIMITS.telegram),
    phone: trimTruncate(body.phone, FIELD_LIMITS.phone),
    message: body.message.trim().slice(0, FIELD_LIMITS.message),
  };
}

/** Validates and truncates an RPC lead: the shared channels plus project/tier/volume. */
export function parseRpcLead(body: Partial<RpcLead>): ValidationError | RpcLead {
  const channels = parseContactChannels(body);
  if (isValidationError(channels)) return channels;

  return {
    ...channels,
    project: trimTruncate(body.project, FIELD_LIMITS.project),
    tier: trimTruncate(body.tier, FIELD_LIMITS.tier),
    volume: trimTruncate(body.volume, FIELD_LIMITS.volume),
  };
}
