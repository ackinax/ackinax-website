import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  "99.9% uptime guarantee",
  "24/7 monitoring & alerts",
  "No hardware management",
];

export default function NodesSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="nodes" className="relative py-24 px-6">
      <div className="max-w-[900px] mx-auto">
        <div ref={ref} className={`${isVisible ? "animate-fade-slide-up" : "opacity-0"}`}>
          <p className="section-label mb-3">NODE INFRASTRUCTURE</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            Block Keeper nodes, fully managed
          </h2>
          <p className="font-body text-sm text-muted-foreground leading-[1.65] max-w-[600px] mb-8">
            Run validator infrastructure on Acki Nacki without the operational overhead. Our Block Keeper nodes provide enterprise-grade uptime, monitoring, and maintenance — so you can focus on building.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-10">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <span className="text-primary font-bold text-base">✓</span>
                <span className="font-body text-sm text-foreground">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://buy.stripe.com/00w3cv7yde0Z0ku92S0ZW04"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Subscribe
            </a>
            <a
              href="https://billing.stripe.com/p/login/00w6oH7yd1ed9V47YO0ZW00"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Manage Account
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
