import { useScrollReveal } from "@/hooks/useScrollReveal";

const reasons = [
  {
    icon: "◆",
    title: "Native to Acki Nacki",
    description: "Purpose-built infrastructure, not a multi-chain afterthought. Optimized for TVM architecture and WASM smart contracts.",
  },
  {
    icon: "⌘",
    title: "Operator-First",
    description: "Real node operations experience. We run the infrastructure we sell, with hands-on expertise in Acki Nacki's consensus protocol.",
  },
  {
    icon: "⬡",
    title: "Decentralized by Design",
    description: "No single point of failure. Block Keeper operations aligned with Acki Nacki's probabilistic consensus philosophy.",
  },
];

export default function WhyAckinax() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 px-6">
      <div className="max-w-[1100px] mx-auto">
        <div ref={ref} className={`mb-12 ${isVisible ? "animate-fade-slide-up" : "opacity-0"}`}>
          <p className="section-label mb-3">WHY ACKINAX</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Built different, on purpose
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reasons.map((r, i) => {
            const { ref: rRef, isVisible: rVis } = useScrollReveal(0.15);
            return (
              <div
                key={r.title}
                ref={rRef}
                className={`card-base transition-all duration-500 ${rVis ? "animate-fade-slide-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-primary text-2xl mb-4 block">{r.icon}</span>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{r.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-[1.65]">{r.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
