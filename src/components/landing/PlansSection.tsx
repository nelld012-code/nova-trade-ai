import { Check, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";

export function PlansSection() {
  const { language, t } = useLanguage(); const en = language === "en";
  const plans = en ? [
    { name: "NOVA STARTER", price: "Free", description: "For discovering TradeNova AI and exploring intelligent trading.", features: ["Basic dashboard", "AI signals", "Portfolio tracking", "Standard support"] },
    { name: "NOVA GROWTH", price: "$9 / month", description: "More tools for users who want greater control.", features: ["Everything in Starter", "Configurable AI robot", "More performance metrics", "Smart alerts"] },
    { name: "NOVA PRO", price: "$29 / month", description: "An advanced experience for users seeking greater depth.", features: ["Everything in Growth", "Advanced robot configuration", "Expanded analysis", "Priority support"], featured: true },
    { name: "NOVA ELITE", price: "$79 / month", description: "The complete level for a premium experience.", features: ["Everything in Pro", "Premium features", "Greater customization", "Priority support"] },
  ] : [
    { name: "NOVA STARTER", price: "Gratis", description: "Para conocer TradeNova AI y empezar a explorar el trading inteligente.", features: ["Dashboard básico", "Señales de IA", "Seguimiento de cartera", "Soporte estándar"] },
    { name: "NOVA GROWTH", price: "$9 / mes", description: "Más herramientas para quienes quieren avanzar con mayor control.", features: ["Todo lo de Starter", "Robot IA configurable", "Más métricas de rendimiento", "Alertas inteligentes"] },
    { name: "NOVA PRO", price: "$29 / mes", description: "Una experiencia avanzada para usuarios que buscan más profundidad.", features: ["Todo lo de Growth", "Configuración avanzada del robot", "Análisis ampliado", "Prioridad de soporte"], featured: true },
    { name: "NOVA ELITE", price: "$79 / mes", description: "El nivel más completo para una experiencia premium.", features: ["Todo lo de Pro", "Funciones premium", "Mayor personalización", "Soporte prioritario"] },
  ];
  return <section id="planes" className="border-t border-border bg-muted/20 py-20 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-2xl text-center"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"><Sparkles className="h-3.5 w-3.5" />{en ? "Flexible plans" : "Planes flexibles"}</div><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{en ? "Choose your level of intelligent trading" : "Elige tu nivel de trading inteligente"}</h2><p className="mt-4 text-muted-foreground">{en ? "Start with the essentials and scale when you need more tools." : "Empieza con lo esencial y escala cuando necesites más herramientas."}</p></div><div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{plans.map((plan) => <Card key={plan.name} className={plan.featured ? "relative border-primary shadow-lg" : "relative"}>{plan.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{en ? "Most popular" : "Más popular"}</div>}<CardHeader><CardTitle className="text-sm tracking-wide">{plan.name}</CardTitle><div className="pt-2 text-2xl font-bold">{plan.price}</div><p className="text-sm text-muted-foreground">{plan.description}</p></CardHeader><CardContent><ul className="space-y-3 text-sm">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /><span>{feature}</span></li>)}</ul><Button asChild className="mt-7 w-full" variant={plan.featured ? "default" : "outline"}><Link to="/register">{en ? "Get started" : "Comenzar"}</Link></Button></CardContent></Card>)}</div></div></section>;
}
