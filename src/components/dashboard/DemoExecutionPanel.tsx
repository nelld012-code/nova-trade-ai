import { useEffect, useRef, useState } from "react";
import { Activity, Clock3, Loader2, PlayCircle, ShieldAlert, Square, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";
import { emitDemoExecution } from "@/lib/demo-events";

type TickResult = { ok?: boolean; mode?: string; realized_pnl?: number; today_pnl?: number; total_pnl?: number; equity?: number; market_price?: number; asset?: string; open_positions?: number; max_open_positions?: number; opened_operation_id?: string | null; closed_operation_id?: string | null };
const INTERVALS = [{ value: "10", label: "10s" }, { value: "30", label: "30s" }, { value: "60", label: "60s" }];

/** Maps the raw messages raised by the demo_execute_tick RPC to user-facing ES/EN text. */
function friendlyRpcError(raw: string, en: boolean) {
  const r = raw.toLowerCase();
  if (r.includes("authentication")) return en ? "Your session expired. Sign in again." : "Tu sesión expiró. Inicia sesión de nuevo.";
  if (r.includes("robot configuration not found")) return en ? "No robot configuration found. Save the AI Robot configuration first." : "No existe configuración del robot. Guarda primero la configuración del Robot IA.";
  if (r.includes("requires demo mode")) return en ? "The robot must be in DEMO mode to run simulation cycles." : "El robot debe estar en modo DEMO para ejecutar ciclos de simulación.";
  if (r.includes("robot is not active")) return en ? "The robot is stopped. Activate it in DEMO mode above and try again." : "El robot está detenido. Actívalo en modo DEMO arriba y vuelve a intentarlo.";
  if (r.includes("kill switch")) return en ? "The risk kill switch is enabled. Disable it in Risk controls to resume." : "El interruptor de emergencia está activado. Desactívalo en Controles de riesgo para continuar.";
  if (r.includes("portfolio not found")) return en ? "No portfolio record exists for this account yet." : "Todavía no existe un registro de portafolio para esta cuenta.";
  if (r.includes("daily loss limit")) return en ? "Daily loss limit reached. Execution is blocked until the next day." : "Se alcanzó el límite de pérdida diaria. La ejecución queda bloqueada hasta el día siguiente.";
  if (r.includes("drawdown")) return en ? "Maximum drawdown reached. Execution is blocked by your risk controls." : "Se alcanzó el drawdown máximo. La ejecución queda bloqueada por tus controles de riesgo.";
  if (r.includes("permission denied") || r.includes("function") && r.includes("does not exist")) return en ? "The DEMO engine is not available for this account." : "El motor DEMO no está disponible para esta cuenta.";
  return raw;
}

export function DemoExecutionPanel({ userId: _userId }: { userId: string }) {
  const { language } = useLanguage(); const en = language === "en";
  const [running, setRunning] = useState(false); const [autoRun, setAutoRun] = useState(false); const [intervalSeconds, setIntervalSeconds] = useState("30");
  const [result, setResult] = useState<TickResult | null>(null); const [error, setError] = useState(""); const [lastRun, setLastRun] = useState<Date | null>(null); const [cycleCount, setCycleCount] = useState(0);
  const busyRef = useRef(false); const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const execute = async () => {
    if (busyRef.current) return; busyRef.current = true; setRunning(true); setError("");
    try {
      const { data, error: rpcError } = await supabase.rpc("demo_execute_tick");
      if (rpcError) { setError(friendlyRpcError(rpcError.message, en)); setAutoRun(false); }
      else { setResult((data ?? {}) as TickResult); setLastRun(new Date()); setCycleCount((value) => value + 1); emitDemoExecution(); }
    } catch (e) {
      setError(friendlyRpcError(e instanceof Error ? e.message : String(e), en)); setAutoRun(false);
    } finally { setRunning(false); busyRef.current = false; }
  };
  const idleCycle = result && !result.opened_operation_id && !result.closed_operation_id;

  useEffect(() => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; if (autoRun) timerRef.current = setInterval(() => void execute(), Number(intervalSeconds) * 1000); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [autoRun, intervalSeconds]);
  const startAuto = async () => { setError(""); setAutoRun(true); await execute(); };

  return <Card className="border-blue-200 bg-blue-50/40 shadow-sm">
    <CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-600" />{en ? "DEMO execution engine" : "Motor de ejecución DEMO"}</CardTitle><CardDescription>{en ? "Use the controls below to execute one simulation cycle or start automatic execution. Results are written atomically to Operations and Portfolio." : "Usa los controles de abajo para ejecutar un ciclo de simulación o iniciar la ejecución automática. Los resultados se escriben de forma atómica en Operaciones y Portafolio."}</CardDescription></div><Badge variant="outline" className={`w-fit shrink-0 ${autoRun ? "border-emerald-300 text-emerald-700" : "border-blue-300 text-blue-700"}`}>{autoRun ? (en ? "RUNNING" : "ACTIVO") : "DEMO"}</Badge></div></CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center"><Button onClick={() => void execute()} disabled={running} className="w-full gap-2 sm:w-auto"><PlayCircle className="h-4 w-4" />{running ? <><Loader2 className="h-4 w-4 animate-spin" />{en ? "Executing..." : "Ejecutando..."}</> : (en ? "Run cycle now" : "Ejecutar ciclo")}</Button>{!autoRun ? <Button variant="outline" onClick={() => void startAuto()} disabled={running} className="w-full gap-2 sm:w-auto"><Activity className="h-4 w-4" />{en ? "Start automatic" : "Iniciar automático"}</Button> : <Button variant="outline" onClick={() => setAutoRun(false)} className="w-full gap-2 sm:w-auto"><Square className="h-4 w-4" />{en ? "Stop automatic" : "Detener automático"}</Button>}<Select value={intervalSeconds} onValueChange={setIntervalSeconds} disabled={autoRun}><SelectTrigger className="w-full bg-white sm:w-[110px]"><SelectValue /></SelectTrigger><SelectContent>{INTERVALS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div><div className="flex items-center gap-2 text-xs text-slate-500"><Clock3 className="h-4 w-4" />{lastRun ? `${en ? "Last cycle" : "Último ciclo"}: ${lastRun.toLocaleTimeString()}` : (en ? "No cycle executed yet" : "Aún no se ejecutó ningún ciclo")}</div></div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-500"><span className="rounded-full border bg-white px-2.5 py-1">{en ? "Cycles" : "Ciclos"}: {cycleCount}</span><span className="rounded-full border bg-white px-2.5 py-1">{en ? "Interval" : "Intervalo"}: {intervalSeconds}s</span><span className="rounded-full border bg-white px-2.5 py-1">{en ? "Mode" : "Modo"}: DEMO</span></div>
      <p className="text-xs text-slate-500">{en ? "Simulation only. No real broker, LIVE order, or real market execution is used." : "Solo simulación. No se utiliza broker real, orden LIVE ni ejecución real de mercado."}</p>
      {result && <><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg border bg-white p-3"><p className="text-xs text-slate-500">{en ? "Market price" : "Precio DEMO"}</p><p className="mt-1 font-semibold">{result.market_price ? `$${Number(result.market_price).toLocaleString("en-US", { maximumFractionDigits: 8 })}` : "—"}</p><p className="text-xs text-slate-400">{result.asset ?? ""}</p></div><div className="rounded-lg border bg-white p-3"><p className="text-xs text-slate-500">{en ? "Realized P&L" : "P&L realizado"}</p><p className={`mt-1 font-semibold ${(result.realized_pnl ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>{(result.realized_pnl ?? 0) >= 0 ? "+" : ""}${(result.realized_pnl ?? 0).toFixed(2)}</p></div><div className="rounded-lg border bg-white p-3"><p className="text-xs text-slate-500">{en ? "Today's P&L" : "P&L de hoy"}</p><p className="mt-1 font-semibold">${(result.today_pnl ?? 0).toFixed(2)}</p></div><div className="rounded-lg border bg-white p-3"><p className="text-xs text-slate-500">{en ? "Open positions" : "Posiciones abiertas"}</p><p className="mt-1 font-semibold">{result.open_positions ?? 0} / {result.max_open_positions ?? 0}</p></div></div><div className="flex flex-wrap gap-2 text-xs"><Badge variant="secondary">{result.opened_operation_id ? (en ? "Position opened" : "Posición abierta") : (en ? "No new position" : "Sin nueva posición")}</Badge><Badge variant="secondary">{result.closed_operation_id ? (en ? "Position settled" : "Posición liquidada") : (en ? "No settlement" : "Sin liquidación")}</Badge><Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" />{en ? "History snapshot saved" : "Snapshot histórico guardado"}</Badge></div></>}
      {idleCycle && !error && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{en ? "The cycle ran but no position was opened or settled. Check that the robot has allocated capital, the portfolio has available balance, and the open-positions limit is not reached." : "El ciclo se ejecutó pero no se abrió ni liquidó ninguna posición. Verifica que el robot tenga capital asignado, que el portafolio tenga saldo disponible y que no se haya alcanzado el límite de posiciones abiertas."}</p>}
      {error && <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><ShieldAlert className="h-4 w-4 shrink-0" />{error}</div>}
    </CardContent>
  </Card>;
}
