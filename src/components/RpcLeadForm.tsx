import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FALLBACK_EMAIL, TIER_OPTIONS, rpcLeadSchema, type RpcLead } from "@/lib/rpcLead";
import { Loader2 } from "lucide-react";

const EMPTY: RpcLead = { name: "", email: "", project: "", tier: "", volume: "", message: "" };

export default function RpcLeadForm({ defaultTier = "", id }: { defaultTier?: string; id?: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RpcLead>({ ...EMPTY, tier: defaultTier });
  const [errors, setErrors] = useState<Partial<Record<keyof RpcLead, string>>>({});
  const [sent, setSent] = useState(false);

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
        body: JSON.stringify(result.data),
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
        <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Thanks — request received</h3>
        <p className="font-body text-sm text-muted-foreground">
          We'll reach out shortly to whitelist your traffic and get your endpoint live. Prefer email?{" "}
          <a href={`mailto:${FALLBACK_EMAIL}`} className="text-primary hover:underline">{FALLBACK_EMAIL}</a>
        </p>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="card-base space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <LeadField label="Name" error={errors.name}>
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" maxLength={100} />
        </LeadField>
        <LeadField label="Email" error={errors.email}>
          <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" maxLength={255} />
        </LeadField>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <LeadField label="Project / company" error={errors.project} optional>
          <Input value={form.project} onChange={(e) => update("project", e.target.value)} placeholder="What are you building?" maxLength={120} />
        </LeadField>
        <LeadField label="Tier of interest" error={errors.tier} optional>
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
        </LeadField>
      </div>

      <LeadField label="Expected volume (RPS or requests/month)" error={errors.volume} optional>
        <Input value={form.volume} onChange={(e) => update("volume", e.target.value)} placeholder="e.g. ~150 RPS sustained, or 200M req/mo" maxLength={120} />
      </LeadField>

      <LeadField label="Use case" error={errors.message}>
        <Textarea
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Bots, mini-app, market making, AI agents on the DEX, getting blocked by Cloudflare…"
          rows={4}
          maxLength={2000}
        />
      </LeadField>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Sending…" : "Request your endpoint"}
      </button>
    </form>
  );
}

function LeadField({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-body text-sm text-foreground">
        {label}
        {optional && <span className="text-muted-foreground font-normal"> (optional)</span>}
      </Label>
      {children}
      {error && <p className="text-destructive text-xs font-body">{error}</p>}
    </div>
  );
}
