import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/landing/HeroSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RobotSection } from "@/components/landing/RobotSection";
import { PerformanceSection } from "@/components/landing/PerformanceSection";
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
      </main>
      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} TradeNova AI. Todos los derechos reservados.</p>
          <p className="text-xs">Trading inteligente. Decisiones más informadas.</p>
        </div>
      </footer>
    </div>
  );
}
