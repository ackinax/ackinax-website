import { useEffect, useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Stat {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 99, suffix: "%", label: "Uptime SLA" },
  { value: 50, prefix: "<", suffix: "ms", label: "Avg Latency" },
  { value: 3, suffix: "/s", label: "Blocks per Thread" },
  { value: 2, suffix: "", label: "Networks Supported" },
];

function AnimatedNumber({ target, prefix, started }: { target: number; prefix?: string; started: boolean }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [started, target]);

  return <>{prefix}{val}</>;
}

export default function NetworkStats() {
  const { ref, isVisible } = useScrollReveal(0.3);

  return (
    <section id="network" className="py-16 px-6">
      <div ref={ref} className="max-w-[1100px] mx-auto card-base !p-10 md:!p-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center ${i < stats.length - 1 ? "md:border-r md:border-border" : ""}`}
            >
              <div className="font-mono-brand text-[42px] font-bold text-foreground leading-none mb-2">
                <AnimatedNumber target={stat.value} prefix={stat.prefix} started={isVisible} />
                <span className="text-primary">{stat.suffix}</span>
              </div>
              <p className="font-body text-[13px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
