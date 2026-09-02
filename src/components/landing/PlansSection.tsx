import { Check, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "NOVA STARTER",
    price: "Gratis",
    description: "Para conocer TradeNova AI y empezar a explorar el trading inteligente.",
    features: ["Dashboard básico", "Señales de IA", "Seguimiento de cartera", "Soporte estándar"],
  },
  {
    name: "NOVA GROWTH",
    price: "$9 / mes",
    description: "Más herramientas para quienes quieren avanzar con mayor control.",
    features: ["Todo lo de Starter", "Robot IA configurable", "Más métricas de rendimiento", "Alertas inteligentes"],
  },
  {
    name: "NOVA PRO",
    price: "$29 / mes",
    description: "Una experiencia avanzada para usuarios que buscan más profundidad.",
    features: ["Todo lo de Growth", "Configuración avanzada del robot", "Análisis ampliado", "Prioridad de soporte"],
    featured: true,
  },
  {
    name: "NOVA ELITE",
    price: "$79 / mes",
    description: "El nivel más completo para una experiencia premium.",
    features: ["Todo lo de Pro", "Funciones premium", "Mayor personalización", "Soporte prioritario"],
  },
];

export function PlansSection() {
  return (
    <section id="planes" className="border-t border-border bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Planes flexibles
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Elige tu nivel de trading inteligente</h2>
          <p className="mt-4 text-muted-foreground">Empieza con lo esencial y escala cuando necesites más herramientas.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.featured ? "relative border-primary shadow-lg" : "relative"}>
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Más popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-sm tracking-wide">{plan.name}</CardTitle>
                <div className="pt-2 text-2xl font-bold">{plan.price}</div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-7 w-full" variant={plan.featured ? "default" : "outline"}>
                  <Link to="/register">Comenzar</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
