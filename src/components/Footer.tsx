const links = [
  { label: "Acki Nacki", href: "https://ackinacki.com" },
  { label: "DoDex", href: "https://www.dex.do" },
  { label: "AckiScan", href: "https://ackiscan.com" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border mt-10">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-mono-brand text-[13px] text-dim">© 2025 Ackinax</span>
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="font-body text-[13px] text-dim hover:text-muted-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
