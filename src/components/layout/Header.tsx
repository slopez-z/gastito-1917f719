import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useEffect } from "react";

const navItems = [
  { to: "/", label: "🏠 Home", end: true },
  { to: "/bancos", label: "🏦 Bancos" },
  { to: "/salario", label: "🔥 Salario" },
  { to: "/gastos", label: "💳 Gastos" },
  { to: "/historial", label: "📊 Historial" },
];

export const Header = () => {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const root = document.documentElement;
      root.style.setProperty("--spotlight-x", `${e.clientX}px`);
      root.style.setProperty("--spotlight-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <header className="relative border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="absolute inset-0 pointer-events-none bg-gradient-spotlight" aria-hidden />
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          💳 Gastito
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex gap-2">
            {navItems.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}>
                {({ isActive }) => (
                  <Button variant="nav" data-active={isActive} size="sm">
                    {label}
                  </Button>
                )}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
