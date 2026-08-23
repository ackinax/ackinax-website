import { useState } from "react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactSchema = z
  .object({
    name: z.string().trim().max(100, "Name must be under 100 characters").optional(),
    email: z.string().trim().max(255, "Email must be under 255 characters").optional(),
    telegram: z.string().trim().max(64, "Keep this under 64 characters").optional(),
    phone: z.string().trim().max(32, "Keep this under 32 characters").optional(),
    message: z.string().trim().min(1, "Message is required").max(2000, "Message must be under 2000 characters"),
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

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", telegram: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ContactForm;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
      if (!res.ok || !data?.success) throw new Error("Request failed");
      toast({ title: "Message sent", description: "Thanks for reaching out, we'll be in touch soon." });
      setForm({ name: "", email: "", telegram: "", phone: "", message: "" });
    } catch {
      toast({
        title: "Couldn't send that",
        description: "Please email us directly at talk@ackinax.com.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        {/* Veil that mutes the grid for legibility: opaque behind the centred form, fading to the sides */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 85% at 50% 42%, hsl(var(--background)) 0%, hsl(var(--background) / 0.85) 45%, transparent 82%)",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[200px] h-[200px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-[600px] mx-auto px-6 md:px-10">
          <p className="section-label mb-3">Get in touch</p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">Contact Us</span>
          </h1>
          <p className="font-body text-muted-foreground mb-10 max-w-md">
            Have a question or want to work together? Drop us a message and we'll get back to you shortly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Message" error={errors.message}>
              <Textarea
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Your message…"
                rows={5}
                maxLength={2000}
              />
            </Field>

            <div className="space-y-5 pt-5 border-t border-border">
              <div>
                <p className="font-mono-brand text-xs uppercase tracking-[0.1em] text-muted-foreground">How can we reach you?</p>
                <p className="font-body text-xs text-muted-foreground mt-1">Add at least one: email, Telegram or phone.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Email" error={errors.email}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@example.com"
                    maxLength={255}
                  />
                </Field>
                <Field label="Telegram" error={errors.telegram}>
                  <Input
                    value={form.telegram}
                    onChange={(e) => handleChange("telegram", e.target.value)}
                    placeholder="@username"
                    maxLength={64}
                  />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Phone" error={errors.phone} hint="Include your country code, e.g. +41 79 123 45 67">
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 555 000 0000"
                    maxLength={32}
                  />
                </Field>
                <Field label="Name" error={errors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                  />
                </Field>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-body text-sm text-foreground">{label}</Label>
      {children}
      {error ? (
        <p className="text-destructive text-xs font-body">{error}</p>
      ) : (
        hint && <p className="text-muted-foreground text-xs font-body">{hint}</p>
      )}
    </div>
  );
}
