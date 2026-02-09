import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function CtaSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="relative py-24 px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.10] blur-[120px] pointer-events-none" style={{ background: "hsl(29 88% 67%)" }} />

      <div ref={ref} className={`relative z-10 max-w-[600px] mx-auto text-center ${isVisible ? "animate-fade-slide-up" : "opacity-0"}`}>
        <h2 className="font-heading text-3xl md:text-[40px] font-bold text-foreground tracking-tight mb-4">
          Ready to get started?
        </h2>
        <p className="font-body text-base text-muted-foreground mb-8">
          Explore our node services or learn how oracle feeds can power your prediction market.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/nodes"
            className="inline-block font-heading font-semibold px-8 py-3.5 rounded-lg text-white glow-peach-sm transition-all duration-300 hover:brightness-110 hover:glow-peach"
            style={{ background: "linear-gradient(135deg, hsl(29 88% 67%), hsl(14 76% 49%))" }}
          >
            Node Subscriptions
          </a>
          <a href="mailto:hello@ackinax.com" className="btn-ghost">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
