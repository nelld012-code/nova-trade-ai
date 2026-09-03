import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, Bell, Bot, CircleDollarSign, TrendingUp, Wallet, WalletCards } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useLanguage } from "@/lib/i18n";
import { DEMO_EXECUTION_EVENT } from "@/lib/demo-events";

type Portfolio = { balance: number; invested: number; performance_pct: number; today_pnl: number; total_deposited: number; total_pnl: number };
type Operation = { id: string; asset: string; direction: string; entry_price: number; exit_price: number | null; pnl: number; return_pct: number; size: number; status: string; opened_at: string; closed_at: string | null };
const demoPortfolio: Portfolio = { balance: 12480, invested: 10000, performance_pct: 24.8, today_pnl: 186.4, total_deposited: 10000, total_pnl: 2480 };
function money(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value); }
function statusLabel(value: string, en: boolean) { const v = value.toLowerCase(); if (v.includes("open") || v.includes("active") || v.includes("abiert")) return en ? "Open" : "Abierta"; if (v.includes("close") || v.includes("complet") || v.includes("cerrad")) return en ? "Closed" : "Cerrada"; return value; }

export const Route = createFileRoute("/dashboard")({ beforeLoad: async () => { const { data: { session } } = await supabase.auth.getSession(); if (!session) throw redirect({ to: "/login" }); return { session }; }, component: DashboardPage });

function DashboardPage() {
  const { session } = Route.useRouteContext(); const { language } = useLanguage(); const en = language === "en";
  const [portfolio, setPortfolio] = useState<Portfolio>(demoPortfolio); const [operations, setOperations] = useState<Operation[]>([]); const [name, setName] = useState("Trader"); const [avatarUrl, setAvatarUrl] = useState<string | null>(null); const [country, setCountry] = useState(""); const [hasPortfolio, setHasPortfolio] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() { const userId = session.user.id; const db = supabase as any; const [{ data: p }, { data: ops }, { data: profile }] = await Promise.all([supabase.from("portfolio").select("balance,invested,performance_pct,today_pnl,total_deposited,total_pnl").eq("user_id", userId).maybeSingle(), supabase.from("operations").select("id,asset,direction,entry_price,exit_price,pnl,return_pct,size,status,opened_at,closed_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5), db.from("profiles").select("full_name,avatar_url,country").eq("id", userId).maybeSingle()]); if (!active) return; if (p) { setPortfolio(p); setHasPortfolio(true); } if (ops) setOperations(ops); if (profile?.full_name) setName(profile.full_name); if (profile?.avatar_url) setAvatarUrl(profile.avatar_url); if (profile?.country) setCountry(profile.country); }
    void load();
    const refresh = () => { void load(); };
    window.addEventListener(DEMO_EXECUTION_EVENT, refresh);
    return () => { active = false; window.removeEventListener(DEMO_EXECUTION_EVENT, refresh); };
  }, [session.user.id]);
  const stats = [
    { title: en ? "Equity" : "Patrimonio", value: money(portfolio.balance), icon: WalletCards, note: `${portfolio.performance_pct >= 0 ? "+" : ""}${portfolio.performance_pct.toFixed(2)}% ${en ? "total" : "total"}` },
    { title: en ? "Today's P&L" : "P&L de hoy", value: money(portfolio.today_pnl), icon: TrendingUp, note: en ? "Today's result" : "Resultado del día" },
    { title: en ? "Total P&L" : "P&L total", value: money(portfolio.total_pnl), icon: CircleDollarSign, note: en ? "Accumulated gain" : "Ganancia acumulada" },
    { title: en ? "Invested capital" : "Capital invertido", value: money(portfolio.invested), icon: ArrowUpRight, note: `${en ? "Deposited" : "Depositado"}: ${money(portfolio.total_deposited)}` },
  ];
  return <DashboardShell email={session.user.email} userName={name} avatarUrl={avatarUrl} countryCode={country}>
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-blue-600">{en ? "Welcome back" : "Bienvenido de nuevo"}</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{en ? "Hello" : "Hola"}, {name.split(" ")[0] || "Trader"} 👋</h1><p className="mt-1 text-sm text-slate-500">{en ? "Here is a summary of your trading activity." : "Este es el resumen de tu actividad de trading."}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" asChild><Link to="/dashboard/fondos"><ArrowDownToLine /> {en ? "Funds" : "Fondos"}</Link></Button><Button asChild><Link to="/dashboard/robot"><Bot /> {en ? "AI Robot" : "Robot IA"}</Link></Button></div></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <Card key={stat.title} className="border-slate-200 shadow-sm"><CardContent className="p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{stat.title}</p><Icon className="h-5 w-5 text-blue-600" /></div><p className="mt-3 text-2xl font-bold">{stat.value}</p><p className="mt-1 text-xs text-slate-500">{stat.note}</p></CardContent></Card>; })}</div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-slate-200 shadow-sm"><CardHeader className="flex flex-row items-center justify-between"><CardTitle>{en ? "Recent operations" : "Operaciones recientes"}</CardTitle><Button variant="ghost" size="sm" asChild><Link to="/dashboard/operaciones">{en ? "View all" : "Ver todas"}</Link></Button></CardHeader><CardContent><div className="space-y-3">{operations.length ? operations.map((op) => <div key={op.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><div><p className="font-medium">{op.asset}</p><p className="text-xs text-slate-500">{op.direction} · {statusLabel(op.status, en)}</p></div><span className={op.pnl >= 0 ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-red-600"}>{op.pnl >= 0 ? "+" : ""}{money(op.pnl)}</span></div>) : <p className="py-8 text-center text-sm text-slate-500">{en ? "There are no recorded operations yet." : "Todavía no hay operaciones registradas."}</p>}</div></CardContent></Card>
        <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle>{en ? "Quick access" : "Accesos rápidos"}</CardTitle></CardHeader><CardContent className="grid gap-2"><Button variant="outline" className="justify-start" asChild><Link to="/dashboard/portafolio"><Wallet /> {en ? "View portfolio" : "Ver portafolio"}</Link></Button><Button variant="outline" className="justify-start" asChild><Link to="/dashboard/notificaciones"><Bell /> {en ? "Notifications" : "Notificaciones"}</Link></Button><Button variant="outline" className="justify-start" asChild><Link to="/dashboard/perfil">{en ? "My profile" : "Mi perfil"}</Link></Button></CardContent></Card>
      </div>
      <Card className="border-amber-200 bg-amber-50/50 shadow-sm"><CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{hasPortfolio ? (en ? "Connected portfolio" : "Portafolio conectado") : (en ? "DEMO mode active" : "Modo DEMO activo")}</p><p className="text-sm text-slate-600">{hasPortfolio ? (en ? "The indicators come from your portfolio record in Supabase." : "Los indicadores proceden de tu registro de portafolio en Supabase.") : (en ? "The displayed values are for demonstration because this account does not have an associated portfolio yet." : "Los valores mostrados son de demostración porque todavía no hay un portafolio asociado a esta cuenta.")}</p></div><span className="text-xs font-semibold uppercase tracking-wide text-amber-700">{hasPortfolio ? "Supabase" : (en ? "Simulation" : "Simulación")}</span></CardContent></Card>
    </section>
  </DashboardShell>;
}
