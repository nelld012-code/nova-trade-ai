import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";

type Risk = { max_position_usd: number; max_daily_loss_usd: number; max_open_positions: number; max_drawdown_pct: number; kill_switch: boolean };
const defaults: Risk = { max_position_usd: 250, max_daily_loss_usd: 100, max_open_positions: 3, max_drawdown_pct: 10, kill_switch: false };

export function RiskControlsPanel({ userId }: { userId: string }) {
  const { language } = useLanguage();
  const en = language === "en";
  const [risk, setRisk] = useState<Risk>(defaults);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const db = supabase as any;

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await db.from("risk_controls").select("max_position_usd,max_daily_loss_usd,max_open_positions,max_drawdown_pct,kill_switch").eq("user_id", userId).maybeSingle();
      if (!active) return;
      if (data) setRisk(data as Risk);
      if (error && !error.message.toLowerCase().includes("relation")) setMessage(en ? "Risk controls could not be loaded." : "No se pudieron cargar los controles de riesgo.");
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId, en]);

  const field = (label: string, value: string | number) => <div className="rounded-xl border bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>;

  return <Card className="border-slate-200 shadow-sm">
    <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-600" />{en ? "Risk controls" : "Controles de riesgo"}</CardTitle><CardDescription>{en ? "Hard limits applied by the DEMO execution engine before it creates or settles an operation." : "Límites estrictos aplicados por el motor DEMO antes de crear o liquidar una operación."}</CardDescription></CardHeader>
    <CardContent className="space-y-5">
      {loading ? <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />{en ? "Loading risk controls…" : "Cargando controles de riesgo…"}</div> : <><div className="grid gap-4 sm:grid-cols-2">{field(en ? "Max position (USD)" : "Posición máxima (USD)", risk.max_position_usd)}{field(en ? "Max daily loss (USD)" : "Pérdida diaria máxima (USD)", risk.max_daily_loss_usd)}{field(en ? "Max open positions" : "Máximo de posiciones abiertas", risk.max_open_positions)}{field(en ? "Max drawdown (%)" : "Drawdown máximo (%)", `${risk.max_drawdown_pct}%`)}</div><div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-red-800">{en ? "Kill switch" : "Interruptor de emergencia"}</p><p className="text-xs text-red-700">{en ? "Blocks DEMO execution immediately." : "Bloquea inmediatamente la ejecución DEMO."}</p></div><span className="text-sm font-semibold text-red-800">{risk.kill_switch ? (en ? "ON" : "ACTIVO") : (en ? "OFF" : "INACTIVO")}</span></div><p className="text-xs text-slate-500">{en ? "These server-enforced limits can only be changed by an administrator." : "Estos límites aplicados en servidor solo pueden ser modificados por un administrador."}</p></>}
      {message && <span className="text-sm text-red-600">{message}</span>}
    </CardContent>
  </Card>;
}
