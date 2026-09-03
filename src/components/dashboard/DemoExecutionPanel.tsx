import { useState } from "react";
import { Activity, Loader2, PlayCircle, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";

type TickResult = { ok?: boolean; mode?: string; realized_pnl?: number; today_pnl?: number; open_positions?: number; max_open_positions?: number };

export function DemoExecutionPanel({ userId }: { userId: string }) {
  const { language } = useLanguage();
  const en = language === "en";
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TickResult | null>(null);
  const [error, setError] = useState("");

  const execute = async () => {
    setRunning(true); setError("");
    const { data, error: rpcError } = await (supabase as any).rpc("demo_execute_tick");
    setRunning(false);
    if (rpcError) { setResult(null); setError(rpcError.message); return; }
    setResult((data ?? {}) as TickResult);
  };

  return <Card className="border-blue-200 bg-blue-50/40 shadow-sm">
    <CardHeader><div className="flex items-start justify-between gap-4"><div><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-600" />{en ? "DEMO execution engine" : "Motor de ejecución DEMO"}</CardTitle><CardDescription>{en ? "Run one controlled simulation tick. Results are written atomically to Operations and Portfolio." : "Ejecuta un ciclo de simulación controlado. El resultado se escribe de forma atómica en Operaciones y Portafolio."}</CardDescription></div><Badge variant="outline">DEMO</Badge></div></CardHeader>
    <CardContent className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><Button onClick={() => void execute()} disabled={running} className="gap-2"><PlayCircle className="h-4 w-4" />{running ? <><Loader2 className="h-4 w-4 animate-spin" />{en ? "Executing..." : "Ejecutando..."}</> : (en ? "Run simulation tick" : "Ejecutar ciclo DEMO")}</Button><span className="text-xs text-slate-500">{en ? "No real broker or LIVE order is used." : "No se utiliza ningún broker real ni orden LIVE."}</span></div>
      {result && <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border bg-white p-3"><p className="text-xs text-slate-500">{en ? "Realized P&L" : "P&L realizado"}</p><p className={`mt-1 font-semibold ${(result.realized_pnl ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>{(result.realized_pnl ?? 0) >= 0 ? "+" : ""}${(result.realized_pnl ?? 0).toFixed(2)}</p></div><div className="rounded-lg border bg-white p-3"><p className="text-xs text-slate-500">{en ? "Today's P&L" : "P&L de hoy"}</p><p className="mt-1 font-semibold">${(result.today_pnl ?? 0).toFixed(2)}</p></div><div className="rounded-lg border bg-white p-3"><p className="text-xs text-slate-500">{en ? "Open positions" : "Posiciones abiertas"}</p><p className="mt-1 font-semibold">{result.open_positions ?? 0} / {result.max_open_positions ?? 0}</p></div></div>}
      {error && <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><ShieldAlert className="h-4 w-4 shrink-0" />{error}</div>}
    </CardContent>
  </Card>;
}
