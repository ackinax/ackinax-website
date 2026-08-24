/**
 * Small shared constants with no other natural home. Kept in a leaf module
 * so worker/index.ts and worker/attio/sync.ts can both depend on it without
 * creating a cycle between them.
 */

/** Window for both the per-isolate rate limiter (worker/index.ts) and the Attio failure-notice detail throttle (worker/attio/sync.ts). */
export const RATE_WINDOW_MS = 60_000;
