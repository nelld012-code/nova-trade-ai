import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/landing/HeroSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RobotSection } from "@/components/landing/RobotSection";
import { PerformanceSection } from "@/components/landing/PerformanceSection";
import { PlansSection } from "@/components/landing/PlansSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TRADE NOVA AI — Intelligent Trading. Smarter Decisions." },
      { name: "description", content: "TRADE NOVA AI: plataforma de trading inteligente con análisis de riesgo, automatización DEMO y herramientas para tomar decisiones más informadas." },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "TRADE NOVA AI — Intelligent Trading. Smarter Decisions." },
      { property: "og:description", content: "La nueva generación del trading inteligente." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useLanguage(); const en = useLanguage().language === "en";
  return <div className="min-h-screen bg-background text-foreground"><SiteHeader /><main><HeroSection /><MetricsSection /><HowItWorks /><RobotSection /><PerformanceSection /><PlansSection /><SecuritySection /></main><footer className="border-t border-border bg-background py-10"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:px-6 lg:px-8"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-foreground">TRADE NOVA AI</p><p className="mt-1">Intelligent Trading. Smarter Decisions.</p></div><div className="flex flex-wrap gap-x-5 gap-y-2"><a href="#como-funciona" className="transition-colors hover:text-foreground">{t("howItWorks")}</a><a href="#robot-ia" className="transition-colors hover:text-foreground">{t("aiRobot")}</a><a href="#rendimientos" className="transition-colors hover:text-foreground">{t("performance")}</a><a href="#planes" className="transition-colors hover:text-foreground">{t("plans")}</a><a href="#seguridad" className="transition-colors hover:text-foreground">{t("security")}</a></div></div><div className="border-t border-border pt-4 text-xs"><p>© {new Date().getFullYear()} TradeNova AI. {en ? "All rights reserved." : "Todos los derechos reservados."}</p></div></div></footer></div>;
}
