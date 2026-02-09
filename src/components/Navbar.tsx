import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/Logo_V2_T-2.svg";
import { Link, useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "Nodes", href: "/nodes" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-border bg-background/80">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 md:px-10 py-4">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Ackinax" className="h-6 md:h-7" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => {
            const cls = "text-muted-foreground hover:text-primary transition-colors duration-300 text-sm font-body";
            if (l.href.includes("#")) {
              return <a key={l.href} href={l.href} className={cls}>{l.label}</a>;
            }
            return <Link key={l.href} to={l.href} className={cls}>{l.label}</Link>;
          })}
        </div>

        <button className="md:hidden text-foreground hover:text-primary transition-colors duration-300" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-6 py-4 flex flex-col gap-4 bg-background/95">
          {navLinks.map((l) => {
            const cls = "text-muted-foreground hover:text-primary transition-colors duration-300 text-sm font-body";
            if (l.href.includes("#")) {
              return <a key={l.href} href={l.href} onClick={() => setOpen(false)} className={cls}>{l.label}</a>;
            }
            return <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className={cls}>{l.label}</Link>;
          })}
        </div>
      )}
    </nav>
  );
}
