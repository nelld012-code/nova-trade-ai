import { useEffect, useState } from "react";
import { Bot, Check, Loader2, Play, Save, ShieldAlert, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const marketOptions = ["BTC/USD", "ETH/USD", "EUR/USD", "XAU/USD"];
const strategies = ["Equilibrada", "Conservadora", "Momentum", "Tendencia"];

export function RobotConfig({ userId }: { userId: string }) {
  const [robotId, setRobotId] = useState<string | null>(null);
  const [strategy, setStrategy] = useState("Equilibrada");
  const [risk, setRisk] = useState("Medio");
  const [mode, setMode] = useState("DEMO");
  const [capital, setCapital] = useState("1000");
  const [markets, setMarkets] = useState<string[]>(["BTC/USD", "ETH/USD"]);
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.from("robots").select("id,strategy,risk_level,mode,capital_allocation,markets,status").eq("user_id", userId).maybeSingle().then(({ data }) => {
      if (!data) return;
      setRobotId(data.id);
      setStrategy(data.strategy || "Equilibrada");
      setRisk(data.risk_level || "Medio");
      setMode(data.mode || "DEMO");
      setCapital(String(data.capital_allocation ?? 1000));
      setMarkets(data.markets?.length ? data.markets : ["BTC/USD", "ETH/USD"]);
      setEnabled(data.status === "active");
    });
  }, [userId]);

  function toggleMarket(market: string) {
    setMarkets((current) => current.includes(market) ? current.filter((item) => item !== market) : [...current, market]);
  }

  async function saveRobot(nextEnabled = enabled) {
    if (markets.length === 0) {
      setMessage("Selecciona al menos un mercado.");
      return;
    }
    if (nextEnabled && mode === "LIVE") {
      setEnabled(false);
      setMessage("El modo LIVE todavía no está disponible. Cambia a DEMO para activar el robot.");
      return;
    }
    setSaving(true);
    setMessage("");
    const payload = {
      user_id: userId,
      strategy,
      risk_level: risk,
      mode,
      capital_allocation: Math.max(0, Number(capital) || 0),
      markets,
      status: nextEnabled ? "active" : "inactive",
    };
    const result = robotId
      ? await supabase.from("robots").update(payload).eq("id", robotId).select("id").maybeSingle()
      : await supabase.from("robots").insert(payload).select("id").single();
    setSaving(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (result.data?.id) setRobotId(result.data.id);
    setEnabled(nextEnabled);
    setMessage(nextEnabled ? "Robot activado en modo DEMO." : "Configuración guardada.");
  }

  return (
    <Card id="robot" className="scroll-mt-24 border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-blue-600" /> Configuración del Robot IA</CardTitle><CardDescription>Configura la estrategia y los límites de la simulación.</CardDescription></div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{mode}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-medium">Estrategia</span><select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">{strategies.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="space-y-2"><span className="text-sm font-medium">Nivel de riesgo</span><select value={risk} onChange={(e) => setRisk(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option>Bajo</option><option>Medio</option><option>Alto</option></select></label>
          <label className="space-y-2"><span className="text-sm font-medium">Capital asignado (USD)</span><Input type="number" min="0" step="100" value={capital} onChange={(e) => setCapital(e.target.value)} /></label>
          <label className="space-y-2"><span className="text-sm font-medium">Modo</span><select value={mode} onChange={(e) => setMode(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option>DEMO</option><option>LIVE</option></select></label>
        </div>

        <div><p className="mb-3 text-sm font-medium">Mercados</p><div className="grid gap-2 sm:grid-cols-2">{marketOptions.map((market) => <button type="button" key={market} onClick={() => toggleMarket(market)} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${markets.includes(market) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}><span>{market}</span>{markets.includes(market) && <Check className="h-4 w-4" />}</button>)}</div></div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">Activar robot</p><p className="text-xs text-slate-500">Solo se ejecuta como simulación mientras esté en DEMO.</p></div><Switch checked={enabled} disabled={saving || mode === "LIVE"} onCheckedChange={(value) => { setEnabled(value); void saveRobot(value); }} /></div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><Button onClick={() => void saveRobot()} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : "Guardar configuración"}</Button><Button variant="outline" onClick={() => void saveRobot(true)} disabled={saving || mode === "LIVE"} className="gap-2"><Play className="h-4 w-4" /> Activar DEMO</Button><Button variant="outline" onClick={() => void saveRobot(false)} disabled={saving} className="gap-2"><Square className="h-4 w-4" /> Detener</Button></div>
        {message && <p className="text-sm text-slate-600">{message}</p>}
        {mode === "LIVE" && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /><span>El modo LIVE requiere una implementación de ejecución real y controles adicionales. Esta versión no ejecuta operaciones reales y no permite activar el robot en LIVE.</span></div>}
      </CardContent>
    </Card>
  );
}
