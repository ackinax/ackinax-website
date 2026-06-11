import { z } from "zod";

/** Email we fall back to when the lead function isn't reachable. */
export const FALLBACK_EMAIL = "talk@ackinax.com";

export const TIER_OPTIONS = [
  "Starter — shared RPC",
  "Commercial — dedicated endpoint",
  "Dedicated / Managed",
  "Run my Block Manager license",
  "Not sure yet",
] as const;

export const rpcLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be under 255 characters"),
  project: z.string().trim().max(120, "Keep this under 120 characters").optional(),
  tier: z.string().trim().max(80).optional(),
  volume: z.string().trim().max(120, "Keep this under 120 characters").optional(),
  message: z.string().trim().min(1, "Tell us a little about your use case").max(2000, "Message must be under 2000 characters"),
});

export type RpcLead = z.infer<typeof rpcLeadSchema>;
