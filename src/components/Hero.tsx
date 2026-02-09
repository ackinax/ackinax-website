export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-[0.12] blur-[120px] pointer-events-none" style={{ background: "hsl(29 88% 67%)" }} />
      <div className="absolute top-[5%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.10] blur-[100px] pointer-events-none" style={{ background: "hsl(14 76% 49%)" }} />

      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-[860px] mx-auto flex flex-col items-center gap-6">
        {/* Status badge */}
        <div className="animate-fade-slide-up animate-stagger-1 inline-flex items-center gap-2.5 px-4 py-2 rounded-full border" style={{ background: "hsl(29 88% 67% / 0.08)", borderColor: "hsl(29 88% 67% / 0.19)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
          <span className="font-mono-brand text-xs font-medium tracking-[0.04em]" style={{ color: "#f7b787" }}>
            ACKI NACKI MAINNET — LIVE
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-slide-up animate-stagger-2 font-heading font-bold leading-[1.05] tracking-[-0.03em]" style={{ fontSize: "clamp(40px, 6vw, 72px)" }}>
          Infrastructure for the{" "}
          <span className="gradient-text">fastest blockchain</span>{" "}
          possible
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-slide-up animate-stagger-3 text-muted-foreground text-lg max-w-[540px] leading-relaxed font-body">
          Oracle data feeds, node infrastructure, and developer tools for the Acki Nacki network.
        </p>

        {/* Buttons */}
        <div className="animate-fade-slide-up animate-stagger-4 flex flex-wrap justify-center gap-4 mt-2">
          <a href="#services" className="btn-primary">Explore Services</a>
          <a href="https://ackinacki.com" target="_blank" rel="noopener noreferrer" className="btn-ghost">
            Learn About Acki Nacki →
          </a>
        </div>
      </div>
    </section>
  );
}
