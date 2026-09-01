import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroPanel } from "./HeroPanel";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 surface-grid opacity-60" aria-hidden="true" />
      <div className="absolute inset-0 hero-glow" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            <span className="size-1.5 rounded-full bg-cyan" />
            Intelligent Trading. Smarter Decisions.
          </span>

          <h1 className="mt-6 text-4xl leading-[1.05] font-extrabold text-foreground sm:text-5xl lg:text-6xl">
            LA NUEVA GENERACIÓN
            <br />
            DEL <span className="text-primary">TRADING INTELIGENTE</span>
          </h1>

          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            TradeNova AI combina análisis algorítmico, automatización y datos de mercado para
            ayudarte a tomar decisiones de trading de forma más inteligente.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link to="/register">
                Empezar ahora <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
              <a href="#como-funciona">Descubrir TradeNova AI</a>
            </Button>
          </div>

          <p className="mt-6 text-sm font-medium text-muted-foreground">
            Trading automatizado <span className="text-cyan">•</span> Análisis IA{" "}
            <span className="text-cyan">•</span> Monitoreo 24/7
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <HeroPanel />
        </div>
      </div>
    </section>
  );
}
