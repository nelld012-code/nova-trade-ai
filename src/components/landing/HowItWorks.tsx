import { BrainCircuit, LineChart, Settings2, UserPlus } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function HowItWorks() {
  const { language, t } = useLanguage();
  const en = language === "en";
  const steps = en ? [
    { n: "01", icon: UserPlus, title: "CREATE YOUR ACCOUNT", text: "Register in minutes with secure authentication and email verification." },
    { n: "02", icon: Settings2, title: "CONFIGURE YOUR STRATEGY", text: "Define risk, markets, operating mode and allocated capital." },
    { n: "03", icon: BrainCircuit, title: "TRADENOVA AI ANALYZES THE MARKET", text: "The engine processes market data and continuously detects signals." },
    { n: "04", icon: LineChart, title: "MONITOR YOUR PORTFOLIO", text: "Track metrics, operations and performance from a clear dashboard." },
  ] : [
    { n: "01", icon: UserPlus, title: "CREA TU CUENTA", text: "Regístrate en minutos con autenticación segura y verificación de correo." },
    { n: "02", icon: Settings2, title: "CONFIGURA TU ESTRATEGIA", text: "Define riesgo, mercados, modo de operación y capital asignado." },
    { n: "03", icon: BrainCircuit, title: "TRADE NOVA AI ANALIZA EL MERCADO", text: "El motor procesa datos de mercado y detecta señales de forma continua." },
    { n: "04", icon: LineChart, title: "MONITOREA TU PORTAFOLIO", text: "Sigue métricas, operaciones y rendimiento desde un panel claro." },
  ];
  return <section id="como-funciona" className="scroll-mt-20 bg-background py-20 lg:py-28"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="eyebrow text-primary">{t("howItWorks")}</p><h2 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">SMART TECHNOLOGY.<br />SIMPLE EXPERIENCE.</h2><p className="mt-4 text-muted-foreground">{en ? "Four steps to put artificial intelligence to work on your market decisions." : "Cuatro pasos para poner la inteligencia artificial a trabajar sobre tus decisiones de mercado."}</p></div><ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{steps.map(({ n, icon: Icon, title, text }) => <li key={n} className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-lift)]"><span className="text-sm font-extrabold text-muted-foreground/60">{n}</span><span className="mt-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="size-5" /></span><h3 className="mt-4 text-sm font-bold text-foreground">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{text}</p></li>)}</ol></div></section>;
}
