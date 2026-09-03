import { useEffect, useState } from "react";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/i18n";

type Risk = { max_position_usd: number; max_daily_loss_usd: number; max_open_positions: number; max_drawdown_pct: number; kill_switch: boolean };
const defaults: Risk = { max_position_usd: 250, max_daily_loss_usd: 100, max_open_positions: 3, max_drawdown_pct: 10, kill_switch: false };

export function RiskControlsPanel({ userId }: { userId: string }) {
  const { language } = useLanguage();
  const en = language === "en";
  const [risk, setRisk] = useState<Risk>(defaults);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const db = supabase as any;

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await db.from("risk_controls").select("max_position_usd,max_daily_loss_usd,max_open_positions,max_drawdown_pct,kill_switch").eq("user_id", userId).maybeSingle();
      if (!active) return;
      if (data) setRisk(data as Risk);
      if (error && !error.message.toLowerCase().includes("relation")) setMessage(error.message);
    })();
    return () => { active = false; };
  }, [userId]);

  const save = async () => {
    setSaving(true); setMessage("");
    const payload: Risk & { user_id: string } = {
      user_id: userId,
      max_position_usd: Math.max(1, Number(risk.max_position_usd) || defaults.max_position_usd),
      max_daily_loss_usd: Math.max(1, Number(risk.max_daily_loss_usd) || defaults.max_daily_loss_usd),
      max_open_positions: Math.min(20, Math.max(1, Math.round(Number(risk.max_open_positions) || defaults.max_open_positions))),
      max_drawdown_pct: Math.min(100, Math.max(0.1, Number(risk.max_drawdown_pct) || defaults.max_drawdown_pct)),
      kill_switch: Boolean(risk.kill_switch),
    };
    const { error } = await db.from("risk_controls").upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) { setMessage(error.message); return; }
    setRisk(payload);
    setMessage(en ? "Risk controls saved." : "Controles de riesgo guardados.");
  };

  const field = (key: keyof Risk, label: string, min: number, step: number) => (
    <label className="space-y-2"><span className="text-sm font-medium">{label}</span><Input type="number" min={min} step={step} value={String(risk[key])} onChange={(e) => setRisk((current) => ({ ...current, [key]: Number(e.target.value) }))} /></label>
  );

  return <Card className="border-slate-200 shadow-sm">
    <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-600" />{en ? "Risk controls" : "Controles de riesgo"}</CardTitle><CardDescription>{en ? "Hard limits applied by the DEMO execution engine before it creates or settles an operation." : "Límites estrictos aplicados por el motor DEMO antes de crear o liquidar una operación."}</CardDescription></CardHeader>
    <CardContent className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">{field("max_position_usd", en ? "Max position (USD)" : "Posición máxima (USD)", 1, 10)}{field("max_daily_loss_usd", en ? "Max daily loss (USD)" : "Pérdida diaria máxima (USD)", 1, 10)}{field("max_open_positions", en ? "Max open positions" : "Máximo de posiciones abiertas", 1, 1)}{field("max_drawdown_pct", en ? "Max drawdown (%)" : "Drawdown máximo (%)", 0.1, 0.5)}</div>
      <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4"><div><p className="font-medium text-red-800">{en ? "Kill switch" : "Interruptor de emergencia"}</p><p className="text-xs text-red-700">{en ? "Blocks DEMO execution immediately." : "Bloquea inmediatamente la ejecución DEMO."}</p></div><Switch checked={risk.kill_switch} onCheckedChange={(value) => setRisk((current) => ({ ...current, kill_switch: value }))} /></div>
      <div className="flex items-center gap-3"><Button onClick={() => void save()} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? (en ? "Saving..." : "Guardando...") : (en ? "Save risk controls" : "Guardar controles")}</Button>{message && <span className="text-sm text-slate-600">{message}</span>}</div>
    </CardContent>
  </Card>;
}
