import { useScrollReveal } from "@/hooks/useScrollReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RpcLeadForm from "@/components/RpcLeadForm";
import {
  Network,
  ShieldCheck,
  Zap,
  Database,
  Target,
  Receipt,
  CheckCircle2,
  Check,
  X,
  Server,
} from "lucide-react";

/* ─── Credibility stats ─── */
const stats = [
  { value: "~⅓", label: "of network Block Keepers operated" },
  { value: "99.9%", label: "uptime SLA" },
  { value: "0ms", label: "rate limit on indexed data" },
  { value: "250", label: "parallel threads supported" },
];

/* ─── Why native differentiators ─── */
const whyCards = [
  {
    Icon: Network,
    title: "Straight from the source",
    desc: "Requests hit the core network directly through infrastructure we operate — no reseller hop, no shared public queue.",
  },
  {
    Icon: ShieldCheck,
    title: "No Cloudflare WAF throttling",
    desc: "Public endpoints flag cloud IPs (Railway, AWS) as bots. Dedicated, whitelisted routing ends the MINER_ENDPOINT_FAILED class of errors for good.",
  },
  {
    Icon: Zap,
    title: "Built for trading & AI agents",
    desc: "Unthrottled, real-time indexed on-chain data — purpose-built for market makers and autonomous agents trading on the DEX.",
  },
  {
    Icon: Database,
    title: "Full archive from genesis",
    desc: "We've run nodes since the first block. Complete history with no gaps in coverage.",
  },
  {
    Icon: Target,
    title: "One chain, done properly",
    desc: "We run Acki Nacki — not 84 chains. Every rack and on-call rotation is dedicated to a single network's performance.",
  },
  {
    Icon: Receipt,
    title: "Bundled pricing, no compute units",
    desc: "Simple bundled request tiers. No 26× method multipliers and no surprise end-of-month bills.",
  },
];

/* ─── Pricing ladder ─── */
const tiers = [
  {
    name: "Starter",
    price: "from $250",
    cadence: "/mo",
    blurb: "Active miners and small bot teams.",
    features: [
      "Shared high-availability endpoint",
      "IP / domain whitelisting",
      "Up to 1–2 TB monthly egress",
      "50–100 RPS",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Commercial",
    price: "from $1,500",
    cadence: "/mo",
    blurb: "Mini-apps, commercial node services, heavy operations.",
    features: [
      "Dedicated endpoint URL",
      "No Cloudflare WAF friction",
      "5–10 TB monthly egress",
      "200+ RPS sustained, bursting higher",
      "99.9% uptime SLA · priority support",
    ],
    featured: true,
  },
  {
    name: "Dedicated / Managed",
    price: "Let's talk",
    cadence: "",
    blurb: "Institutional scale and whitelabel platforms.",
    features: [
      "Fully-managed dedicated infrastructure",
      "Custom firewall rules & dedicated IPs",
      "Unthrottled indexed-data access",
      "Custom egress & concurrency",
      "Hands-on onboarding",
    ],
    featured: false,
  },
];

/* ─── Comparison table ─── */
const comparison = [
  { feature: "Core-network access", ackinax: "Direct Block Keeper", generic: "Proxied / shared" },
  { feature: "Cloudflare WAF throttling", ackinax: "None — whitelisted", generic: "Common on public tiers" },
  { feature: "Pricing model", ackinax: "Bundled requests", generic: "Compute units (×26 methods)" },
  { feature: "Indexed-data rate limit", ackinax: "0ms — unthrottled", generic: "Tiered limits" },
  { feature: "Archive coverage", ackinax: "From genesis", generic: "Often partial" },
  { feature: "Chain focus", ackinax: "Acki Nacki only", generic: "80+ chains, none deeply" },
];

/* ─── Quickstart ─── */
const steps = [
  { n: "1", title: "Request access", desc: "Tell us your use case and volume. We whitelist your IPs and domains." },
  { n: "2", title: "Point your client", desc: "Swap in your dedicated endpoint URL — no code changes beyond the host." },
  { n: "3", title: "Ship", desc: "Direct, unthrottled access. No rate-limit surprises in production." },
];

export default function Rpc() {
  const { ref: heroRef, isVisible: heroVis } = useScrollReveal(0.1);
  const { ref: whyRef, isVisible: whyVis } = useScrollReveal();
  const { ref: priceRef, isVisible: priceVis } = useScrollReveal();
  const { ref: compRef, isVisible: compVis } = useScrollReveal();
  const { ref: startRef, isVisible: startVis } = useScrollReveal();
  const { ref: bmRef, isVisible: bmVis } = useScrollReveal();
  const { ref: formRef, isVisible: formVis } = useScrollReveal();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Glow orbs */}
      <div
        className="fixed top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-[0.08] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(29 88% 67%), transparent 70%)" }}
      />
      <div
        className="fixed bottom-[-200px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(14 76% 49%), transparent 70%)" }}
      />

      <Navbar />

      {/* ─── 1. Hero ─── */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-[1100px] mx-auto" ref={heroRef}>
          <div className={`max-w-[760px] ${heroVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-6"
              style={{ background: "hsl(29 88% 67% / 0.08)", borderColor: "hsl(29 88% 67% / 0.19)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
              <span className="font-mono-brand text-xs font-medium tracking-[0.04em]" style={{ color: "#f7b787" }}>
                ACKI NACKI — NATIVE RPC
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-[-0.03em] leading-[1.08] mb-6">
              RPC for Acki Nacki, <span className="gradient-text">straight from the source</span>
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground leading-[1.65] max-w-[600px] mb-8">
              We operate roughly a third of the network's Block Keepers. That means dedicated, unthrottled endpoints with
              direct access to the core network — no shared public gateways, no Cloudflare throttling, no compute-unit
              guesswork.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#request" className="btn-primary">Request your endpoint</a>
              <a href="#pricing" className="btn-ghost">View pricing</a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Credibility stat bar ─── */}
      <section className="pb-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border p-6 text-center"
                style={{ background: "hsl(29 88% 67% / 0.05)" }}
              >
                <p className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">{s.value}</p>
                <p className="font-body text-xs text-muted-foreground leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. Why native ─── */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto" ref={whyRef}>
          <div className={`${whyVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            <p className="section-label mb-3 text-center">WHY NATIVE INFRASTRUCTURE</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3 text-center">
              The provider that helps run the network
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center max-w-[600px] mx-auto mb-12">
              Multi-chain providers proxy the chain. We help produce it — and that changes what we can offer.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {whyCards.map((c) => (
                <div key={c.title} className="card-base group relative overflow-hidden transition-all duration-300">
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(90deg, hsl(29 88% 67%), transparent)" }}
                  />
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <c.Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{c.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-[1.65]">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Pricing ─── */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto" ref={priceRef}>
          <div className={`${priceVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            <p className="section-label mb-3 text-center">PRICING</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3 text-center">
              One ladder, from first bot to full scale
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center max-w-[600px] mx-auto mb-12">
              Bundled per-request pricing — pay for throughput, not per-method multipliers. Final quote is shaped to your
              volume and egress.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {tiers.map((t) => (
                <div
                  key={t.name}
                  className={`card-base relative overflow-hidden ${t.featured ? "border-primary/40" : ""}`}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                      background: t.featured
                        ? "linear-gradient(90deg, hsl(29 88% 67%), hsl(14 76% 49%))"
                        : "transparent",
                    }}
                  />
                  {t.featured && (
                    <span className="absolute top-4 right-4 font-mono-brand text-[10px] uppercase tracking-[0.1em] text-primary">
                      Most popular
                    </span>
                  )}
                  <p className="section-label mb-2">{t.name}</p>
                  <div className="mb-2">
                    <span className="font-heading text-4xl font-bold text-foreground">{t.price}</span>
                    <span className="font-body text-muted-foreground ml-1">{t.cadence}</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground mb-6">{t.blurb}</p>
                  <ul className="space-y-3 mb-8">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                        <span className="font-body text-sm text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#request" className={`${t.featured ? "btn-primary" : "btn-ghost"} w-full block text-center`}>
                    Request your endpoint
                  </a>
                </div>
              ))}
            </div>
            <p className="font-body text-xs text-muted-foreground text-center mt-6">
              Egress beyond the included allowance billed per TB. Prices indicative — exact quote on request.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 5. Comparison ─── */}
      <section className="py-20 px-6">
        <div className="max-w-[900px] mx-auto" ref={compRef}>
          <div className={`${compVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            <p className="section-label mb-3 text-center">HOW WE COMPARE</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-12 text-center">
              Native vs. generic multi-chain RPC
            </h2>

            <div className="card-base overflow-x-auto p-0">
              <table className="w-full border-collapse min-w-[520px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-body text-xs text-muted-foreground font-medium px-5 py-4">&nbsp;</th>
                    <th className="text-left font-heading text-sm text-primary font-semibold px-5 py-4">AckiNax</th>
                    <th className="text-left font-body text-sm text-muted-foreground font-medium px-5 py-4">
                      Generic provider
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.feature} className="border-b border-border/60 last:border-0">
                      <td className="font-body text-sm text-foreground px-5 py-4">{row.feature}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 font-body text-sm text-foreground">
                          <Check size={15} className="text-primary shrink-0" />
                          {row.ackinax}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground">
                          <X size={15} className="text-muted-foreground/60 shrink-0" />
                          {row.generic}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Quickstart ─── */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto" ref={startRef}>
          <div className={`${startVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            <p className="section-label mb-3 text-center">GETTING STARTED</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-12 text-center">
              Live and whitelisted, fast
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {steps.map((s) => (
                <div key={s.n} className="card-base">
                  <div className="font-heading text-2xl font-bold text-primary mb-3">{s.n}</div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-[1.65]">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="max-w-[560px] mx-auto">
              <p className="font-body text-xs text-muted-foreground mb-2 text-center">Your dedicated endpoint</p>
              <div className="rounded-lg border border-border bg-card px-5 py-4 text-center">
                <code className="font-mono-brand text-sm text-primary break-all">
                  https://rpc.ackinax.com/v1/&lt;your-key&gt;
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Managed Block Manager ─── */}
      <section className="py-20 px-6">
        <div className="max-w-[800px] mx-auto" ref={bmRef}>
          <div className={`${bmVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            <div className="card-base text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Server size={24} className="text-primary" />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-3">
                Already hold a Block Manager license?
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-[1.65] max-w-[560px] mx-auto mb-8">
                Skip the hardware. We'll run your Block Manager on dedicated, monitored infrastructure as part of the
                network — you keep the license, we keep it online and performing.
              </p>
              <a href="#request" className="btn-ghost">Talk to us about managed hosting</a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. Request form ─── */}
      <section id="request" className="py-20 px-6 scroll-mt-24">
        <div className="max-w-[720px] mx-auto" ref={formRef}>
          <div className={`${formVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            <p className="section-label mb-3 text-center">REQUEST ACCESS</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3 text-center">
              Get your endpoint live
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center max-w-[520px] mx-auto mb-10">
              Tell us what you're building and your expected volume. We'll come back with a quote and whitelist your
              traffic.
            </p>
            <RpcLeadForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
