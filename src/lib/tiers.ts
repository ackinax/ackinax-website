/**
 * RPC pricing tiers. Shared between the browser-side lead form
 * (src/lib/rpcLead.ts) and the Attio schema setup script
 * (scripts/attio-setup.ts, worker/attio/schema.ts) so the CRM's Sub-Type
 * options can never drift from what the form actually offers.
 */
export const TIER_OPTIONS = [
  "Starter · shared endpoint",
  "Commercial · dedicated endpoint",
  "Dedicated / Managed · fully managed",
  "Managed Block Manager hosting",
  "Not sure yet",
] as const;
