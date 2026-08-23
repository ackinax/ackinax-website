import { z } from "zod";
import { EMAIL_RE, FIELD_LIMITS } from "@/lib/leadFields";
import { TIER_OPTIONS } from "@/lib/tiers";

export { EMAIL_RE, FIELD_LIMITS, TIER_OPTIONS };

/** Email we fall back to when the lead function isn't reachable. */
export const FALLBACK_EMAIL = "talk@ackinax.com";

export const rpcLeadSchema = z
  .object({
    name: z.string().trim().max(FIELD_LIMITS.name, "Name must be under 100 characters").optional(),
    email: z.string().trim().max(FIELD_LIMITS.email, "Email must be under 255 characters").optional(),
    telegram: z.string().trim().max(FIELD_LIMITS.telegram, "Keep this under 64 characters").optional(),
    phone: z.string().trim().max(FIELD_LIMITS.phone, "Keep this under 32 characters").optional(),
    project: z.string().trim().max(FIELD_LIMITS.project, "Keep this under 120 characters").optional(),
    tier: z.string().trim().max(FIELD_LIMITS.tier).optional(),
    volume: z.string().trim().max(FIELD_LIMITS.volume, "Keep this under 120 characters").optional(),
    message: z
      .string()
      .trim()
      .min(1, "Tell us a little about your use case")
      .max(FIELD_LIMITS.message, "Message must be under 2000 characters"),
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
