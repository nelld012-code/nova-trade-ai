import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, Bot, CircleDollarSign, TrendingUp, WalletCards } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
    return { session };
  },
  component: DashboardPage,
});

type Portfolio = {
  balance: number;
  invested: number;
  performance_pct: number;
  today_pnl: number;
  total_deposited: number;
  total_pnl: number;
};

type Operation = { id: string; asset: string; direction: string; pnl: number; return_pct: number; status: string; created_at: string };

const demoPortfolio: Portfolio = { balance: 12480, invested: 10000, performance_pct: 24.8, today_pnl: 186.4, total_deposited: 10000, total_pnl: 2480 };

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function DashboardPage() {
  const { session } = Route.useRouteContext();
  const [portfolio, setPortfolio] = useState<Portfolio>(demoPortfolio);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [name, setName] = useState("Trader");

  useEffect(() => {
    let active = true;
    async function load() {
      const userId = session.user.id;
      const [{ data: p }, { data: ops }, { data: profile }] = await Promise.all([
        supabase.from("portfolio").select("balance,invested,performance_pct,today_pnl,total_deposited,total_pnl").eq("user_id", userId).maybeSingle(),
        supabase.from("operations").select("id,asset,direction,pnl,return_pct,status,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
        supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
      ]);
      if (!active) return;
      if (p) setPortfolio(p);
      if (ops) setOperations(ops);
      if (profile?.full_name) setName(profile.full_name.split(" ")[0]);
    }
    load();
    return () => { active = false; };
  }, [session.user.id]);

  const stats = [
    { title: "Patrimonio", value: money(portfolio.balance), icon: WalletCards, note: `${portfolio.performance_pct >= 0 ? "+" : ""}${portfolio.performance_pct.toFixed(2)}% total` },
    { title: "P&L de hoy", value: money(portfolio.today_pnl), icon: TrendingUp, note: "Resultado del día" },
    { title: "P&L total", value: money(portfolio.total_pnl), icon: CircleDollarSign, note: "Ganancia acumulada" },
    { title: "Capital invertido", value: money(portfolio.invested), icon: ArrowUpRight, note: `Depositado: ${money(portfolio.total_deposited)}` },
  ];

  return (
    <DashboardShell email={session.user.email}>
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-blue-600">Bienvenido de nuevo</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Hola, {name} 👋</h1>
            <p className="mt-1 text-sm text-slate-500">Aquí tienes un resumen de tu actividad de trading.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><a href="/dashboard#depositar"><ArrowDownToLine /> Depositar</a></Button>
            <Button asChild><a href="/dashboard#robot"><Bot /> Robot IA</a></Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return <Card key={stat.title} className="border-slate-200 shadow-sm"><CardContent className="p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{stat.title}</p><Icon className="h-5 w-5 text-blue-600" /></div><p className="mt-3 text-2xl font-bold">{stat.value}</p><p className="mt-1 text-xs text-slate-500">{stat.note}</p></CardContent></Card>;
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card id="operaciones" className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Operaciones recientes</CardTitle></CardHeader>
            <CardContent>
              {operations.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center"><p className="font-medium">Aún no hay operaciones reales</p><p className="mt-1 text-sm text-slate-500">Las operaciones aparecerán aquí cuando existan registros en tu cuenta.</p></div> : <div className="space-y-3">{operations.map((op) => <div key={op.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="font-semibold">{op.asset}</p><p className="text-xs text-slate-500">{op.direction} · {op.status}</p></div><div className="text-right"><p className={op.pnl >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>{op.pnl >= 0 ? "+" : ""}{money(op.pnl)}</p><p className="text-xs text-slate-500">{op.return_pct.toFixed(2)}%</p></div></div>)}</div>}
            </CardContent>
          </Card>

          <Card id="robot" className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Robot IA</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-600 p-2"><Bot className="h-5 w-5" /></div><div><p className="font-semibold">Trade Nova AI</p><p className="text-xs text-slate-400">Modo demostración</p></div></div><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-sm text-slate-300">Estado</span><span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-300">Configuración pendiente</span></div><Button className="mt-4 w-full" variant="secondary" asChild><a href="/dashboard#configurar-robot">Configurar robot</a></Button></div>
            </CardContent>
          </Card>
        </div>

        <Card id="portafolio" className="border-amber-200 bg-amber-50/50 shadow-sm">
          <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Modo DEMO activo</p><p className="text-sm text-slate-600">Los valores de ejemplo solo se muestran cuando tu cuenta todavía no tiene datos de portafolio. No representan rentabilidad garantizada.</p></div><span className="text-xs font-semibold uppercase tracking-wide text-amber-700">Simulación</span></CardContent>
        </Card>
      </section>
    </DashboardShell>
  );
}
