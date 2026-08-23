/**
 * Turns free-text contact fields into normalized identifiers, and decides
 * which one keys a lead in Attio - or that none does (KTD2, R3, R5).
 *
 * A phone without a leading "+" is deliberately left unnormalized: guessing
 * a country code from a bare national number is the highest-risk false-merge
 * available here, and this site has no signal (billing address, account
 * locale) that would make the guess safe.
 */

const TELEGRAM_RE = /^[a-z][a-z0-9_]{4,31}$/;
const E164_RE = /^\+[1-9]\d{7,14}$/;

export type MatchKeyKind = "email" | "telegram" | "phone";

/** KTD2's canonical precedence order - the single place this ordering is defined. */
export const MATCH_KEY_KINDS: readonly MatchKeyKind[] = ["email", "telegram", "phone"];

export interface MatchKey {
  kind: MatchKeyKind;
  value: string;
}

export interface NormalizedIdentity {
  email?: string;
  telegram?: string;
  phone?: string;
}

/**
 * Trim and lowercase. Plus-addressing and dots are preserved deliberately -
 * stripping them is Gmail-specific folklore that merges distinct mailboxes
 * on other providers.
 */
export function normalizeEmail(input: string | undefined): string | undefined {
  const trimmed = input?.trim();
  return trimmed ? trimmed.toLowerCase() : undefined;
}

/** Valid E.164 only. A number with no leading "+" returns undefined - it is not a match key. */
export function normalizePhone(input: string | undefined): string | undefined {
  const trimmed = input?.trim();
  if (!trimmed) return undefined;

  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  const candidate = hasLeadingPlus ? `+${digits}` : digits;

  return E164_RE.test(candidate) ? candidate : undefined;
}

/** Strips @ / t.me prefixes and enforces Telegram's own username rule (5-32 chars, starts with a letter). */
export function normalizeTelegram(input: string | undefined): string | undefined {
  const trimmed = input?.trim();
  if (!trimmed) return undefined;

  let handle = trimmed.toLowerCase();
  handle = handle.replace(/^https?:\/\/t\.me\//, "");
  handle = handle.replace(/^t\.me\//, "");
  handle = handle.replace(/^@/, "");
  handle = handle.replace(/\/$/, "");

  return TELEGRAM_RE.test(handle) ? handle : undefined;
}

/** Normalizes every identity channel a submission may carry. */
export function normalizeIdentity(fields: {
  email?: string;
  telegram?: string;
  phone?: string;
}): NormalizedIdentity {
  return {
    email: normalizeEmail(fields.email),
    telegram: normalizeTelegram(fields.telegram),
    phone: normalizePhone(fields.phone),
  };
}

/** KTD2 precedence, via MATCH_KEY_KINDS: email, then Telegram, then phone. Never name. First present wins. */
export function chooseMatchKey(identity: NormalizedIdentity): MatchKey | undefined {
  for (const kind of MATCH_KEY_KINDS) {
    const value = identity[kind];
    if (value) return { kind, value };
  }
  return undefined;
}
