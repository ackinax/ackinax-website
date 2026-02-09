import { useScrollReveal } from "@/hooks/useScrollReveal";
import logo from "@/assets/logo-v2.svg";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Clock, Server, Zap, CheckCircle2, ExternalLink } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "99.9% Uptime SLA",
    description: "Enterprise-grade reliability with redundant infrastructure and automated failover systems.",
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Round-the-clock monitoring with real-time alerts and proactive issue resolution.",
  },
  {
    icon: Server,
    title: "Fully Managed",
    description: "No hardware, no maintenance headaches. We handle all operations so you can focus on building.",
  },
  {
    icon: Zap,
    title: "Instant Provisioning",
    description: "Get your Block Keeper node running quickly with streamlined onboarding and setup.",
  },
];

const included = [
  "Dedicated Block Keeper node",
  "Automated software updates",
  "Performance dashboards",
  "Priority support channel",
  "No long-term lock-in",
  "Network-aligned configuration",
];

export default function Nodes() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.1);
  const { ref: featRef, isVisible: featVisible } = useScrollReveal();
  const { ref: pricingRef, isVisible: pricingVisible } = useScrollReveal();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Glow orbs */}
      <div className="fixed top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-[0.08] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(29 88% 67%), transparent 70%)" }} />
      <div className="fixed bottom-[-200px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(14 76% 49%), transparent 70%)" }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-border" style={{ backgroundColor: "hsl(220 33% 4% / 0.8)" }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 md:px-10 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="font-mono-brand text-sm font-bold text-white leading-none">A</span>
            </div>
            <span className="font-mono-brand text-lg font-bold text-foreground">ackinax</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-body">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative">
        <div className="max-w-[900px] mx-auto" ref={heroRef}>
          <div className={`flex flex-col items-center text-center ${heroVisible ? "animate-fade-slide-up" : "opacity-0"}`}>
            <img src={logo} alt="Ackinax" className="h-16 md:h-20 mb-8 opacity-90" />

            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-8" style={{ background: "hsl(29 88% 67% / 0.08)", borderColor: "hsl(29 88% 67% / 0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
              <span className="font-mono-brand text-xs font-medium tracking-[0.04em]" style={{ color: "hsl(29 80% 72%)" }}>
                BLOCK KEEPER NODES — ACTIVE
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-[-0.03em] leading-[1.05] mb-5">
              Nodes as a <span className="gradient-text">Service</span>
            </h1>

            <p className="font-body text-base md:text-lg text-muted-foreground leading-[1.65] max-w-[560px] mb-10">
              Enterprise-grade Block Keeper node infrastructure for the Acki Nacki network. Fully managed validator operations with guaranteed uptime — subscribe and start validating.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://buy.stripe.com/00w3cv7yde0Z0ku92S0ZW04"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                Subscribe Now
                <ExternalLink size={15} />
              </a>
              <a
                href="https://billing.stripe.com/p/login/00w6oH7yd1ed9V47YO0ZW00"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex items-center gap-2"
              >
                Manage Account
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6">
        <div className="max-w-[900px] mx-auto" ref={featRef}>
          <div className={`${featVisible ? "animate-fade-slide-up" : "opacity-0"}`}>
            <p className="section-label mb-3 text-center">WHY OUR NODES</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-12 text-center">
              Infrastructure you can rely on
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map((f) => (
                <div key={f.title} className="card-base group hover:bg-card-hover transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-[1.65]">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / What's included */}
      <section className="py-20 px-6">
        <div className="max-w-[900px] mx-auto" ref={pricingRef}>
          <div className={`${pricingVisible ? "animate-fade-slide-up" : "opacity-0"}`}>
            <div className="card-base relative overflow-hidden">
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-secondary" />

              <div className="flex flex-col md:flex-row gap-10">
                {/* Left */}
                <div className="flex-1">
                  <p className="section-label mb-3">NODE SUBSCRIPTION</p>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-4">
                    Block Keeper Node
                  </h2>
                  <p className="font-body text-sm text-muted-foreground leading-[1.65] mb-6">
                    Run validator infrastructure on Acki Nacki without the operational overhead. Our Block Keeper nodes provide enterprise-grade uptime, monitoring, and maintenance.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a
                      href="https://buy.stripe.com/00w3cv7yde0Z0ku92S0ZW04"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      Subscribe
                    </a>
                    <a
                      href="https://billing.stripe.com/p/login/00w6oH7yd1ed9V47YO0ZW00"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost text-sm"
                    >
                      Manage Account
                    </a>
                  </div>
                </div>

                {/* Right — included list */}
                <div className="flex-1">
                  <h3 className="font-heading text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">What's included</h3>
                  <ul className="space-y-3">
                    {included.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                        <span className="font-body text-sm text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[400px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, hsl(29 88% 67%), transparent 70%)" }} />
        </div>
        <div className="relative max-w-[600px] mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            Questions?
          </h2>
          <p className="font-body text-base text-muted-foreground mb-8">
            Reach out and we'll help you find the right setup for your needs.
          </p>
          <a href="mailto:hello@ackinax.com" className="btn-ghost">
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
