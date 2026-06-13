import { z } from "zod";

/** Email we fall back to when the lead function isn't reachable. */
export const FALLBACK_EMAIL = "talk@ackinax.com";

export const TIER_OPTIONS = [
  "Starter · shared endpoint",
  "Commercial · dedicated endpoint",
  "Dedicated / Managed · fully managed",
  "Managed Block Manager hosting",
  "Not sure yet",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const rpcLeadSchema = z
  .object({
    name: z.string().trim().max(100, "Name must be under 100 characters").optional(),
    email: z.string().trim().max(255, "Email must be under 255 characters").optional(),
    telegram: z.string().trim().max(64, "Keep this under 64 characters").optional(),
    phone: z.string().trim().max(32, "Keep this under 32 characters").optional(),
    project: z.string().trim().max(120, "Keep this under 120 characters").optional(),
    tier: z.string().trim().max(80).optional(),
    volume: z.string().trim().max(120, "Keep this under 120 characters").optional(),
    message: z.string().trim().min(1, "Tell us a little about your use case").max(2000, "Message must be under 2000 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.email && !EMAIL_RE.test(data.email)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Invalid email address" });
    }
    if (!data.email && !data.telegram && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Add at least one way to reach you: email, Telegram or phone",
      });
    }
  });

export type RpcLead = z.infer<typeof rpcLeadSchema>;
