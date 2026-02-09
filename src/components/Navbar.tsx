import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/Logo_V2_T-2.svg";
import { Link, useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Network", href: "#network" },
  { label: "Nodes", href: "/nodes" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-border" style={{ backgroundColor: "hsl(220 33% 4% / 0.8)" }}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 md:px-10 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Ackinax" className="h-6 md:h-7" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) =>
            l.href.startsWith("/") ? (
              <Link key={l.href} to={l.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">
                {l.label}
              </a>
            )
          )}
          <a href="#services" className="btn-primary text-sm !py-2.5 !px-6">
            Get Started
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border px-6 py-4 flex flex-col gap-4" style={{ backgroundColor: "hsl(220 33% 4% / 0.95)" }}>
          {navLinks.map((l) =>
            l.href.startsWith("/") ? (
              <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">
                {l.label}
              </a>
            )
          )}
          <a href="#services" onClick={() => setOpen(false)} className="btn-primary text-sm text-center !py-2.5">
            Get Started
          </a>
        </div>
      )}
    </nav>
  );
}
