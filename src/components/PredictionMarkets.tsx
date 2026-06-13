import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  { num: "1", title: "Define Market", subtitle: "Set your prediction parameters and conditions" },
  { num: "2", title: "Deploy on DoDex", subtitle: "Publish your market contract on-chain" },
  { num: "3", title: "Oracle Resolves", subtitle: "Our feeds verify outcomes and trigger settlement" },
];

export default function PredictionMarkets() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="relative py-24 px-6">
      {/* Coral glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[120px] pointer-events-none" style={{ background: "hsl(14 76% 49%)" }} />

      <div className="max-w-[900px] mx-auto relative z-10">
        <div ref={ref} className={`mb-12 ${isVisible ? "animate-fade-slide-up" : "opacity-0"}`}>
          <p className="section-label-coral mb-3">PREDICTION MARKETS</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-6">
            Your market. Your rules. Our data.
          </h2>
          <div className="max-w-[640px] space-y-4">
            <p className="font-body text-sm text-muted-foreground leading-[1.65]">
              Ackinax oracle feeds power decentralized prediction markets on DoDex. We deliver verified event outcomes on-chain so anyone can create markets, set terms, and let smart contracts handle settlement.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-[1.65]">
              From price movements to real-world events: define your market, publish it on-chain, and our oracle infrastructure ensures trustworthy resolution.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-stretch gap-0 mb-10">
          {steps.map((step, i) => {
            const { ref: sRef, isVisible: sVis } = useScrollReveal(0.15);
            return (
              <div key={step.num} className="flex flex-col md:flex-row items-center flex-1">
                <div
                  ref={sRef}
                  className={`card-base flex-1 flex flex-col items-center text-center transition-all duration-500 ${sVis ? "animate-fade-slide-up" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
                    <span className="font-mono-brand text-sm font-bold text-primary">{step.num}</span>
                  </div>
                  <h4 className="font-heading text-base font-semibold text-foreground mb-1">{step.title}</h4>
                  <p className="font-body text-xs text-muted-foreground">{step.subtitle}</p>
                </div>
                {i < steps.length - 1 && (
                  <>
                    {/* Horizontal connector (desktop) */}
                    <div className="hidden md:block w-8 h-px bg-primary/30 flex-shrink-0" />
                    {/* Vertical connector (mobile) */}
                    <div className="md:hidden w-px h-8 bg-primary/30 flex-shrink-0" />
                  </>
                )}
              </div>
            );
          })}
        </div>

        <a href="https://www.dex.do" target="_blank" rel="noopener noreferrer" className="btn-ghost inline-block">
          Learn More About DoDex →
        </a>
      </div>
    </section>
  );
}
