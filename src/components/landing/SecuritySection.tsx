import { LockKeyhole, ShieldCheck, Eye, ServerCog } from "lucide-react";

const items = [
  { icon: LockKeyhole, title: "Protección de datos", text: "Diseñada para mantener la información de cada usuario separada y protegida." },
  { icon: ShieldCheck, title: "Control y gestión del riesgo", text: "Herramientas pensadas para ayudarte a configurar límites y tomar decisiones con mayor control." },
  { icon: Eye, title: "Transparencia", text: "Visualiza operaciones, métricas y configuración desde una experiencia clara." },
  { icon: ServerCog, title: "Arquitectura preparada", text: "Una base moderna preparada para integrar autenticación, base de datos y servicios de trading." },
];

export function SecuritySection() {
  return (
    <section id="seguridad" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Seguridad y control desde el primer día</h2>
          <p className="mt-4 text-muted-foreground">Una experiencia construida para que tengas claridad sobre tus datos, configuración y operaciones.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-muted-foreground">TradeNova AI es una plataforma de software. La información mostrada en la sección de rendimientos puede ser demostrativa y no constituye una promesa de rentabilidad.</p>
      </div>
    </section>
  );
}
