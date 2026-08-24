/**
 * Field rules shared between the browser-side Zod schema (src/lib/rpcLead.ts)
 * and the Worker's server-side validation (worker/lead.ts). Zero dependencies
 * so the Worker can import it without pulling Zod into its bundle.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Name of the honeypot field: hidden in both forms, so only an automated
 * submitter fills it. Deliberately named for something a naive bot is happy
 * to fill but no browser autofill or password manager has a concept of -
 * a field named `email`, `url` or `phone` risks being filled for a real
 * person, and a false positive here costs a real lead.
 */
export const HONEYPOT_FIELD = "subject";

export const FIELD_LIMITS = {
  name: 100,
  email: 255,
  telegram: 64,
  phone: 32,
  project: 120,
  tier: 80,
  volume: 120,
  message: 2000,
} as const;
