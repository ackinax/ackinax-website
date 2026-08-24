import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FALLBACK_EMAIL, TIER_OPTIONS, rpcLeadSchema, type RpcLead } from "@/lib/rpcLead";
import { Loader2 } from "lucide-react";
import FormField, { RequiredMark } from "@/components/FormField";
import HoneypotField from "@/components/HoneypotField";
import { HONEYPOT_FIELD } from "@/lib/leadFields";

const EMPTY: RpcLead = { name: "", email: "", telegram: "", phone: "", project: "", tier: "", volume: "", message: "" };

export default function RpcLeadForm({ defaultTier = "", id }: { defaultTier?: string; id?: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RpcLead>({ ...EMPTY, tier: defaultTier });
  const [errors, setErrors] = useState<Partial<Record<keyof RpcLead, string>>>({});
  const [sent, setSent] = useState(false);
  // Kept out of `form` so the honeypot can never leak into the typed lead shape.
  const [honeypot, setHoneypot] = useState("");

  const update = (field: keyof RpcLead, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = rpcLeadSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RpcLead, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RpcLead;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/rpc-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, [HONEYPOT_FIELD]: honeypot }),
      });
      const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
      if (!res.ok || !data?.success) throw new Error("Request failed");
      setSent(true);
      setForm({ ...EMPTY, tier: defaultTier });
      toast({ title: "Request received", description: "We'll be in touch shortly to get your endpoint live." });
    } catch {
      toast({
        title: "Couldn't send that",
        description: `Please email us directly at ${FALLBACK_EMAIL}.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div id={id} className="card-base text-center">
        <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Thanks, request received</h3>
        <p className="font-body text-sm text-muted-foreground">
          We'll reach out shortly to get you live. Feel free to reach out by email{" "}
          <a href={`mailto:${FALLBACK_EMAIL}`} className="text-primary hover:underline">{FALLBACK_EMAIL}</a>.
        </p>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="card-base space-y-5">
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <FormField label="Use case" error={errors.message} required>
        <Textarea
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Bots, mini-app, market making, AI agents on the DEX, getting blocked by Cloudflare…"
          rows={4}
          maxLength={2000}
        />
      </FormField>

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="Project / company" error={errors.project}>
          <Input value={form.project} onChange={(e) => update("project", e.target.value)} placeholder="What are you building?" maxLength={120} />
        </FormField>
        <FormField label="Tier of interest" error={errors.tier}>
          <select
            value={form.tier}
            onChange={(e) => update("tier", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select a tier…</option>
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Expected volume (RPS or requests/month)" error={errors.volume}>
        <Input value={form.volume} onChange={(e) => update("volume", e.target.value)} placeholder="e.g. ~150 RPS sustained, or 200M req/mo" maxLength={120} />
      </FormField>

      <div className="space-y-5 pt-5 border-t border-border">
        <div>
          <p className="font-mono-brand text-xs uppercase tracking-[0.1em] text-muted-foreground">
            How can we reach you?
            <RequiredMark />
          </p>
          <p className="font-body text-xs text-muted-foreground mt-1">Add at least one: email, Telegram or phone.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField label="Email" error={errors.email}>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" maxLength={255} />
          </FormField>
          <FormField label="Telegram" error={errors.telegram}>
            <Input value={form.telegram} onChange={(e) => update("telegram", e.target.value)} placeholder="@username" maxLength={64} />
          </FormField>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField label="Phone" error={errors.phone} hint="Include your country code, e.g. +41 79 123 45 67">
            <Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555 000 0000" maxLength={32} />
          </FormField>
          <FormField label="Name" error={errors.name}>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" maxLength={100} />
          </FormField>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Sending…" : "Request your endpoint"}
      </button>
    </form>
  );
}

