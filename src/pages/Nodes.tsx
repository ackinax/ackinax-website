import { useScrollReveal } from "@/hooks/useScrollReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Globe, Shield, MapPin, Network, Cpu, ShieldCheck, Leaf, Server, CheckCircle2 } from "lucide-react";

/* ─── Section 2 data ─── */
const whyCards = [{
  Icon: Zap,
  title: "High Performance",
  desc: "Optimized hardware configurations delivering consistent, reliable performance for Acki Nacki validation."
}, {
  Icon: Globe,
  title: "Premium Connectivity",
  desc: "NetIX peering with direct routes to major networks ensuring minimal latency and maximum uptime."
}, {
  Icon: Shield,
  title: "Enterprise Security",
  desc: "Multi-layered security with DDoS protection, encrypted connections, and 24/7 monitoring."
}];

/* ─── Section 3 data ─── */
const pricingChecklist = ["High-performance hardware", "Premium NetIX connectivity", "24/7 monitoring", "99.9% uptime SLA", "Technical support"];

/* ─── Section 4 data ─── */
const stats = [{
  value: "99.9%",
  label: "Uptime Guarantee"
}, {
  value: "24/7",
  label: "Active Monitoring"
}, {
  value: "<1ms",
  label: "Network Latency"
}];

/* ─── Section 5 data ─── */
const greenTags = ["Solar Energy", "Wind Power", "Carbon Neutral"];

/* ─── Section 6 data ─── */
const infraCards = [{
  Icon: MapPin,
  title: "Heart of Europe's Connectivity",
  desc: "Strategically located at Europe's connectivity center, providing optimal routing to all major networks."
}, {
  Icon: Network,
  title: "Most Connected Datacenter",
  desc: "Direct peering with all major service providers ensuring the lowest latency and best route optimization."
}, {
  Icon: Zap,
  title: "End-to-end Fiber Connectivity",
  desc: "Full fiber infrastructure delivering ultra-low latency connections across the entire network path."
}, {
  Icon: Cpu,
  title: "Enterprise Level Hardware",
  desc: "Latest generation server hardware with redundant components for maximum reliability and performance."
}, {
  Icon: ShieldCheck,
  title: "ISO Certified",
  desc: "ISO 27001, ISO 22301, and ISO 50001 certifications ensuring the highest standards in security, business continuity, and energy management."
}];
export default function Nodes() {
  const {
    ref: heroRef,
    isVisible: heroVis
  } = useScrollReveal(0.1);
  const {
    ref: whyRef,
    isVisible: whyVis
  } = useScrollReveal();
  const {
    ref: priceRef,
    isVisible: priceVis
  } = useScrollReveal();
  const {
    ref: scaleRef,
    isVisible: scaleVis
  } = useScrollReveal();
  const {
    ref: greenRef,
    isVisible: greenVis
  } = useScrollReveal();
  const {
    ref: infraRef,
    isVisible: infraVis
  } = useScrollReveal();
  return <div className="min-h-screen bg-background relative">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Glow orbs */}
      <div className="fixed top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-[0.08] pointer-events-none" style={{
      background: "radial-gradient(circle, hsl(29 88% 67%), transparent 70%)"
    }} />
      <div className="fixed bottom-[-200px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-[0.06] pointer-events-none" style={{
      background: "radial-gradient(circle, hsl(14 76% 49%), transparent 70%)"
    }} />

      <Navbar />

      {/* ─── 1. Hero ─── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-[1100px] mx-auto" ref={heroRef}>
          <div className={`grid md:grid-cols-2 gap-12 items-center ${heroVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            {/* Left */}
            <div>
              <p className="section-label mb-4">NODES AS A SERVICE</p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-[-0.03em] leading-[1.08] mb-6">
                High-Performance Nodes,{" "}
                <span className="gradient-text">Built for Acki Nacki</span>
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground leading-[1.65] max-w-[520px] mb-8">
                Enterprise-grade infrastructure with premium NetIX connectivity. Tailored specifically for the Acki Nacki network with optimized performance and reliability.
              </p>
              <a href="#pricing" className="btn-primary">
                View Pricing
              </a>
            </div>

            {/* Right — decorative server visual */}
            <div className="flex justify-center">
              <div className="relative w-[280px] h-[280px] rounded-3xl border border-border bg-card flex items-center justify-center gap-6">
                <div className="absolute inset-0 rounded-3xl opacity-20" style={{
                background: "radial-gradient(circle at 50% 40%, hsl(29 88% 67%), transparent 70%)"
              }} />
                <Server size={64} className="text-primary relative z-10" strokeWidth={1.2} />
                <Server size={64} className="text-secondary relative z-10" strokeWidth={1.2} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Why Choose Our Nodes ─── */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto" ref={whyRef}>
          <div className={`${whyVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            <p className="section-label mb-3 text-center">WHY CHOOSE US</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3 text-center">
              Why Choose Our Nodes?
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center max-w-[560px] mx-auto mb-12">
              Purpose-built infrastructure designed to maximize your returns on the Acki Nacki network.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {whyCards.map(c => <div key={c.title} className="card-base group transition-all duration-300 bg-background">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <c.Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{c.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-[1.65]">{c.desc}</p>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Pricing ─── */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-[480px] mx-auto" ref={priceRef}>
          <div className={`${priceVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            <div className="card-base relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-secondary" />
              <p className="section-label mb-2">NODE LICENSE</p>
              <p className="font-body text-sm text-muted-foreground mb-6">For Acki Nacki validators</p>

              <div className="mb-8">
                <span className="font-heading text-5xl font-bold text-foreground">€20</span>
                <span className="font-body text-muted-foreground ml-1">/month</span>
              </div>

              <ul className="space-y-3 mb-8 text-left inline-block">
                {pricingChecklist.map(item => <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-primary shrink-0" />
                    <span className="font-body text-sm text-foreground">{item}</span>
                  </li>)}
              </ul>

              <div className="mb-6">
                <a href="https://buy.stripe.com/00w3cv7yde0Z0ku92S0ZW04" target="_blank" rel="noopener noreferrer" className="btn-primary w-full block text-center">
                  Subscribe Now
                </a>
              </div>

              <p className="font-body text-xs text-muted-foreground">
                Need volume pricing?{" "}
                <a href="/contact" className="text-primary hover:underline">
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Scalable by Nature ─── */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto" ref={scaleRef}>
          <div className={`${scaleVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            <p className="section-label mb-3 text-center">PERFORMANCE</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3 text-center">
              Scalable by Nature
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center max-w-[600px] mx-auto mb-12">
              Our lower-density node infrastructure is designed to maximize your yields. With fewer nodes per server, each validator receives dedicated resources, resulting in more consistent performance and higher potential returns.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map(s => <div key={s.label} className="rounded-xl border border-border p-8 text-center" style={{
              background: "hsl(29 88% 67% / 0.05)"
            }}>
                  <p className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">{s.value}</p>
                  <p className="font-body text-sm text-muted-foreground">{s.label}</p>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Renewable Energy ─── */}
      <section className="py-20 px-6">
        <div className="max-w-[800px] mx-auto" ref={greenRef}>
          <div className={`${greenVis ? "animate-fade-slide-up" : "opacity-0"}`}>
            <div className="card-base text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Leaf size={24} className="text-primary" />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-3">
                Powered by 100% Renewable Energy
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-[1.65] max-w-[560px] mx-auto mb-8">
                Our data center is powered entirely by renewable energy sources. We're committed to sustainable blockchain infrastructure, ensuring that your participation in the network contributes to a greener future.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {greenTags.map(tag => <span key={tag} className="font-mono-brand text-xs px-4 py-2 rounded-full border border-border" style={{
                background: "hsl(29 88% 67% / 0.08)",
                color: "hsl(29 80% 72%)"
              }}>
                    {tag}
                  </span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. World-Class Infrastructure ─── */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto" ref={infraRef}>
          <div className="">
            <p className="section-label mb-3 text-center">DATACENTER</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3 text-center">
              World-Class Infrastructure
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center max-w-[600px] mx-auto mb-12">
              Our datacenter facilities meet the highest industry standards for security, connectivity, and reliability.
            </p>

            {/* 3 + 2 grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {infraCards.slice(0, 3).map(c => <div key={c.title} className="card-base group relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, hsl(29 88% 67%), transparent)" }} />
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <c.Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{c.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-[1.65]">{c.desc}</p>
                </div>)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {infraCards.slice(3).map(c => <div key={c.title} className="card-base group relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, hsl(29 88% 67%), transparent)" }} />
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <c.Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{c.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-[1.65]">{c.desc}</p>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. CTA / Contact ─── */}
      <section className="py-20 px-6 text-center relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[400px] rounded-full opacity-[0.08]" style={{
          background: "radial-gradient(circle, hsl(29 88% 67%), transparent 70%)"
        }} />
        </div>
        <div className="relative max-w-[600px] mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            Questions?
          </h2>
          <p className="font-body text-base text-muted-foreground mb-8">
            Reach out and we'll help you find the right setup for your needs.
          </p>
          <a href="/contact" className="btn-ghost">
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </div>;
}