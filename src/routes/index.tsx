import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/landing/HeroSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RobotSection } from "@/components/landing/RobotSection";
import { PerformanceSection } from "@/components/landing/PerformanceSection";
import { PlansSection } from "@/components/landing/PlansSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { SiteHeader } from "@/components/landing/SiteHeader";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <HeroSection />
        <MetricsSection />
        <HowItWorks />
        <RobotSection />
        <PerformanceSection />
        <PlansSection />
        <SecuritySection />
      </main>
      <footer className="border-t border-border bg-background py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-foreground">TRADE NOVA AI</p>
              <p className="mt-1">Intelligent Trading. Smarter Decisions.</p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <a href="#como-funciona" className="transition-colors hover:text-foreground">Cómo funciona</a>
              <a href="#robot-ia" className="transition-colors hover:text-foreground">Robot IA</a>
              <a href="#rendimientos" className="transition-colors hover:text-foreground">Rendimientos</a>
              <a href="#planes" className="transition-colors hover:text-foreground">Planes</a>
              <a href="#seguridad" className="transition-colors hover:text-foreground">Seguridad</a>
            </div>
          </div>
          <div className="border-t border-border pt-4 text-xs">
            <p>© {new Date().getFullYear()} TradeNova AI. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
