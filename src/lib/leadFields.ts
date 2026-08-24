/**
 * Field rules shared between the browser-side Zod schema (src/lib/rpcLead.ts)
 * and the Worker's server-side validation (worker/lead.ts). Zero dependencies
 * so the Worker can import it without pulling Zod into its bundle.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
