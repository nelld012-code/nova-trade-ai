import { BarChart3, CircleDollarSign, PieChart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Portfolio = { balance: number; invested: number; performance_pct: number; today_pnl: number; total_deposited: number; total_pnl: number };

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function PortfolioPanel({ portfolio }: { portfolio: Portfolio }) {
  const metrics = [
    { label: "Patrimonio actual", value: money(portfolio.balance), icon: CircleDollarSign },
    { label: "Capital invertido", value: money(portfolio.invested), icon: PieChart },
    { label: "P&L acumulado", value: money(portfolio.total_pnl), icon: TrendingUp },
    { label: "Rendimiento", value: `${portfolio.performance_pct >= 0 ? "+" : ""}${portfolio.performance_pct.toFixed(2)}%`, icon: BarChart3 },
  ];
  return (
    <Card id="portafolio" className="scroll-mt-24 border-slate-200 shadow-sm">
      <CardHeader><CardTitle>Portafolio</CardTitle><p className="text-sm text-slate-500">Vista consolidada de tu capital y resultados.</p></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl bg-slate-50 p-4"><Icon className="h-5 w-5 text-blue-600" /><p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-medium">Resultado de hoy</p><p className={`mt-2 text-2xl font-bold ${portfolio.today_pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>{portfolio.today_pnl >= 0 ? "+" : ""}{money(portfolio.today_pnl)}</p><p className="mt-1 text-xs text-slate-500">P&L registrado en el portafolio.</p></div>
          <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-medium">Total depositado</p><p className="mt-2 text-2xl font-bold text-slate-900">{money(portfolio.total_deposited)}</p><p className="mt-1 text-xs text-slate-500">Capital ingresado a la cuenta.</p></div>
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5"><p className="font-medium">Histórico de rendimiento</p><p className="mt-1 text-sm text-slate-500">El gráfico histórico se habilitará cuando exista una serie temporal de rendimiento en Supabase. No se inventan datos históricos.</p></div>
      </CardContent>
    </Card>
  );
}
