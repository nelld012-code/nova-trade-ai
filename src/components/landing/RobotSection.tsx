import { Link } from "@tanstack/react-router";
import { ArrowRight, Bot, Gauge, Layers, Radar, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Radar, title: "Análisis de mercado", text: "Procesa precio, volumen y volatilidad de múltiples activos en tiempo real." },
  { icon: Sparkles, title: "Detección de señales", text: "Identifica patrones y oportunidades con modelos de aprendizaje automático." },
  { icon: ShieldAlert, title: "Gestión de riesgo", text: "Límites de exposición, stop-loss dinámico y protección de capital." },
  { icon: Gauge, title: "Modos de operación", text: "Conservador, Balanceado o Activo según tu perfil de inversor." },
  { icon: Layers, title: "Multi-mercado", text: "Cripto, Forex, Índices y Acciones desde un mismo panel." },
  { icon: Bot, title: "Automatización 24/7", text: "El robot trabaja sin descanso; tú decides cuándo activarlo o pausarlo." },
];

export function RobotSection() {
  return (
    <section id="robot-ia" className="scroll-mt-20 bg-gradient-navy py-20 text-navy-foreground lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow text-cyan">Robot IA</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              UN MOTOR DE TRADING
              <br />
              QUE NUNCA DUERME
            </h2>
            <p className="mt-5 max-w-xl text-base text-white/65">
              TradeNova Engine analiza el mercado de forma continua, detecta señales y ejecuta
              tu estrategia con disciplina algorítmica. Tú mantienes el control total: activa,
              pausa y ajusta el riesgo cuando quieras.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6">
                <Link to="/register">
                  Activar mi robot <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/20 bg-transparent px-6 text-navy-foreground hover:bg-white/10 hover:text-navy-foreground">
                <a href="#planes">Ver planes</a>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl bg-white/[0.05] p-5 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08]">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/25 text-cyan">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-sm font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-white/60">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
