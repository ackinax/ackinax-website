import { useScrollReveal } from "@/hooks/useScrollReveal";
interface ServiceCard {
  icon: string;
  title: string;
  description: string;
  status: "LIVE" | "ACTIVE" | "AVAILABLE" | "COMING SOON";
  href?: string;
}
const cards: ServiceCard[] = [{
  icon: "◎",
  title: "Oracle Data Feeds",
  description: "Verified real-world data delivered on-chain. Create and resolve your own prediction markets on DoDex with reliable oracle infrastructure.",
  status: "LIVE"
}, {
  icon: "⬡",
  title: "Nodes as a Service",
  description: "Enterprise-grade Block Keeper node operations for the Acki Nacki network. Subscribe for dedicated validator infrastructure with guaranteed uptime.",
  status: "ACTIVE"
}, {
  icon: "⚡",
  title: "RPC Endpoints",
  description: "Dedicated RPC co-located with our Block Keeper nodes — near-zero latency to the core network. Unthrottled access, no shared public gateways.",
  status: "AVAILABLE",
  href: "/rpc"
}, {
  icon: "{ }",
  title: "GraphQL API",
  description: "Query blockchain state, account data, and transaction history. Structured access to the full Acki Nacki dataset.",
  status: "COMING SOON"
}];
function statusColor(status: ServiceCard["status"]) {
  if (status === "COMING SOON") return {
    text: "hsl(215 17% 42%)",
    bg: "hsl(215 17% 42% / 0.1)",
    border: "hsl(215 17% 42% / 0.3)"
  };
  return {
    text: "hsl(160 60% 45%)",
    bg: "hsl(160 60% 45% / 0.1)",
    border: "hsl(160 60% 45% / 0.3)"
  };
}
function Card({
  card,
  index
}: {
  card: ServiceCard;
  index: number;
}) {
  const {
    ref,
    isVisible
  } = useScrollReveal(0.15);
  const isSoon = card.status === "COMING SOON";
  const colors = statusColor(card.status);
  const gradientColor = card.status === "COMING SOON" ? "hsl(29 88% 67%)" : "hsl(160 60% 45%)";
  return <div ref={ref} className={`card-base relative overflow-hidden transition-all duration-500 ${isVisible ? "animate-fade-slide-up" : "opacity-0"} ${isSoon ? "opacity-50 cursor-default" : "group cursor-pointer"}`} style={{
    animationDelay: `${index * 100}ms`
  }}>
      {/* Top gradient line on hover */}
      {!isSoon && <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
      background: `linear-gradient(90deg, ${gradientColor}, transparent)`
    }} />}

      <div className="" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <span className="text-[28px] leading-none">{card.icon}</span>
          <span className="font-mono-brand text-[10px] font-medium tracking-wider px-2.5 py-1 rounded-full border" style={{
          color: colors.text,
          backgroundColor: colors.bg,
          borderColor: colors.border
        }}>
            {card.status}
          </span>
        </div>
        <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{card.title}</h3>
        <p className="font-body text-sm text-muted-foreground leading-[1.65]">{card.description}</p>
      </div>
      {card.href && !isSoon && <a href={card.href} aria-label={card.title} className="absolute inset-0 z-20 rounded-xl" />}
    </div>;
}
export default function Services() {
  const {
    ref,
    isVisible
  } = useScrollReveal();
  return <section id="services" className="relative py-24 px-6">
      <div className="max-w-[1100px] mx-auto">
        <div ref={ref} className={`mb-12 ${isVisible ? "animate-fade-slide-up" : "opacity-0"}`}>
          <p className="section-label mb-3">INFRASTRUCTURE SERVICES</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Build on Acki Nacki with confidence
          </h2>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="inline-block w-2 h-2 rounded-full bg-[hsl(160_60%_45%)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
          <span className="font-mono-brand text-xs tracking-[0.2em] text-muted-foreground">
            ACKI NACKI MAINNET — <span className="text-[hsl(160_60%_45%)]">LIVE</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((card, i) => <Card key={card.title} card={card} index={i} />)}
        </div>
      </div>
    </section>;
}