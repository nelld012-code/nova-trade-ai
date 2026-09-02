import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Save, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type UserProfile = { id: string; full_name: string; email: string };
type PortfolioValues = { balance: string; invested: string; total_deposited: string; today_pnl: string; total_pnl: string; performance_pct: string };
const emptyValues: PortfolioValues = { balance: "0", invested: "0", total_deposited: "0", today_pnl: "0", total_pnl: "0", performance_pct: "0" };
function numberValue(value: string) { const parsed = Number(value.replace(",", ".")); return Number.isFinite(parsed) ? parsed : NaN; }

export function AdminPortfolioControl({ userId }: { userId: string }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [values, setValues] = useState<PortfolioValues>(emptyValues);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const db = supabase as any;
      const { data, error: roleError } = await db.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (!active) return;
      const allowed = !roleError && data === true;
      setIsAdmin(allowed);
      setChecking(false);
      if (!allowed) return;
      const { data: profiles, error: profilesError } = await db.from("profiles").select("id,full_name,email").order("full_name", { ascending: true });
      if (profilesError) { setError(profilesError.message); return; }
      const list = (profiles ?? []) as UserProfile[];
      setUsers(list);
      if (list[0]) setSelectedUserId(list[0].id);
    }
    void load();
    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    if (!isAdmin || !selectedUserId) return;
    let active = true;
    async function loadPortfolio() {
      setError(null);
      const db = supabase as any;
      const { data, error: portfolioError } = await db.from("portfolio").select("balance,invested,total_deposited,today_pnl,total_pnl,performance_pct").eq("user_id", selectedUserId).maybeSingle();
      if (!active) return;
      if (portfolioError) { setError(portfolioError.message); return; }
      setValues(data ? {
        balance: String(data.balance ?? 0), invested: String(data.invested ?? 0), total_deposited: String(data.total_deposited ?? 0),
        today_pnl: String(data.today_pnl ?? 0), total_pnl: String(data.total_pnl ?? 0), performance_pct: String(data.performance_pct ?? 0),
      } : emptyValues);
    }
    void loadPortfolio();
    return () => { active = false; };
  }, [isAdmin, selectedUserId]);

  if (checking || !isAdmin) return null;

  async function saveValues() {
    setMessage(null); setError(null);
    const parsed = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, numberValue(value)])) as Record<keyof PortfolioValues, number>;
    if (Object.values(parsed).some((value) => !Number.isFinite(value))) { setError("Todos los valores deben ser números válidos."); return; }
    if (["balance", "invested", "total_deposited"].some((key) => parsed[key as keyof PortfolioValues] < 0)) { setError("Patrimonio, capital invertido y total depositado no pueden ser negativos."); return; }
    setSaving(true);
    const db = supabase as any;
    const { error: saveError } = await db.from("portfolio").update({ ...parsed, updated_at: new Date().toISOString() }).eq("user_id", selectedUserId);
    setSaving(false);
    if (saveError) setError(saveError.message); else setMessage("Valores del dashboard actualizados correctamente.");
  }

  const selectedUser = users.find((user) => user.id === selectedUserId);
  const setValue = (key: keyof PortfolioValues, value: string) => setValues((current) => ({ ...current, [key]: value }));

  return <Card id="administracion" className="border-blue-200 bg-blue-50/30 shadow-sm">
    <CardHeader><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-600 p-2 text-white"><ShieldCheck className="h-5 w-5" /></div><div><CardTitle>Administración · Valores del dashboard</CardTitle><CardDescription>Solo visible para administradores. Puedes modificar los indicadores financieros de cada usuario.</CardDescription></div></div></CardHeader>
    <CardContent className="space-y-5">
      {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{message}</div>}
      {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</div>}
      <div className="space-y-2"><label className="text-sm font-medium">Usuario</label><div className="relative"><Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><select value={selectedUserId} onChange={(event) => { setSelectedUserId(event.target.value); setMessage(null); }} className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"><option value="">Selecciona un usuario</option>{users.map((user) => <option key={user.id} value={user.id}>{user.full_name || "Sin nombre"} · {user.email}</option>)}</select></div>{selectedUser && <p className="text-xs text-slate-500">Editando: {selectedUser.email}</p>}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[["balance", "Patrimonio", "Saldo total mostrado"], ["today_pnl", "P&L de hoy", "Resultado del día"], ["total_pnl", "P&L total", "Ganancia acumulada"], ["invested", "Capital invertido", "Capital actualmente invertido"], ["total_deposited", "Total depositado", "Importe depositado"], ["performance_pct", "Rendimiento total (%)", "Porcentaje mostrado junto a Patrimonio"]].map(([key, label, hint]) => <div key={key} className="space-y-2"><label className="text-sm font-medium">{label}</label><Input inputMode="decimal" value={values[key as keyof PortfolioValues]} onChange={(event) => setValue(key as keyof PortfolioValues, event.target.value)} /><p className="text-xs text-slate-500">{hint}</p></div>)}
      </div>
      <Button onClick={saveValues} disabled={!selectedUserId || saving}><Save />{saving ? "Guardando..." : "Guardar valores"}</Button>
      <p className="text-xs text-slate-500">Los cambios se guardan en el portafolio del usuario y se reflejan en sus tarjetas de Patrimonio, P&L y Capital invertido.</p>
    </CardContent>
  </Card>;
}
