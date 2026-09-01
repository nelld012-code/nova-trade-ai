import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Robot IA", href: "/#robot-ia" },
  { label: "Rendimientos", href: "/#rendimientos" },
  { label: "Planes", href: "/#planes" },
  { label: "Seguridad", href: "/#seguridad" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 shadow-[var(--shadow-soft)] backdrop-blur-xl"
          : "border-b border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="TradeNova AI inicio">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Crear cuenta</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" aria-label="Abrir menú">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm">
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <div className="mt-2 flex flex-col gap-1 p-4">
              <Logo className="mb-6" />
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-6 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Crear cuenta</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
