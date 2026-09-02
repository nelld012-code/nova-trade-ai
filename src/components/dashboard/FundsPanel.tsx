import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const date = (value: string) => new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(value));

type Deposit = { id: string; amount: number; method: string; reference: string | null; status: string; created_at: string };
type Withdrawal = { id: string; amount: number; method: string; destination: string; status: string; created_at: string };

function Status({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const cls = normalized.includes("approved") || normalized.includes("completed") || normalized.includes("complet") || normalized.includes("approved")
    ? "bg-emerald-50 text-emerald-700"
    : normalized.includes("reject") || normalized.includes("cancel") || normalized.includes("failed")
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${cls}`}>{value || "pendiente"}</span>;
}

export function FundsPanel({ userId }: { userId: string }) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank transfer");
  const [destination, setDestination] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: d }, { data: w }] = await Promise.all([
      supabase.from("deposits").select("id,amount,method,reference,status,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("withdrawals").select("id,amount,method,destination,status,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    ]);
    setDeposits(d ?? []);
    setWithdrawals(w ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [userId]);

  async function requestDeposit() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return setMessage("Introduce un importe válido.");
    setBusy(true); setMessage("");
    const { error } = await supabase.from("deposits").insert({ user_id: userId, amount: value, method, status: "pending" });
    setBusy(false);
    if (error) return setMessage(error.message);
    setAmount(""); setMessage("Solicitud de depósito registrada."); await load();
  }

  async function requestWithdrawal() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || !destination.trim()) return setMessage("Introduce importe y destino válidos.");
    setBusy(true); setMessage("");
    const { error } = await supabase.from("withdrawals").insert({ user_id: userId, amount: value, method, destination: destination.trim(), status: "pending" });
    setBusy(false);
    if (error) return setMessage(error.message);
    setAmount(""); setDestination(""); setMessage("Solicitud de retiro registrada."); await load();
  }

  return <div id="depositar" className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><ArrowDownToLine className="h-5 w-5 text-emerald-600" /> Depositar fondos</CardTitle></CardHeader><CardContent className="space-y-4">
        <div><Label htmlFor="funds-amount">Importe (USD)</Label><Input id="funds-amount" className="mt-1" type="number" min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" /></div>
        <div><Label htmlFor="funds-method">Método</Label><select id="funds-method" value={method} onChange={e => setMethod(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option>Bank transfer</option><option>Crypto</option><option>Card</option></select></div>
        <Button className="w-full" onClick={requestDeposit} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <ArrowDownToLine />} Solicitar depósito</Button>
      </CardContent></Card>
      <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><ArrowUpFromLine className="h-5 w-5 text-blue-600" /> Retirar fondos</CardTitle></CardHeader><CardContent className="space-y-4">
        <div><Label htmlFor="withdraw-destination">Destino</Label><Input id="withdraw-destination" className="mt-1" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Cuenta o wallet de destino" /></div>
        <p className="text-xs text-slate-500">Por seguridad, verifica cuidadosamente el destino antes de solicitar un retiro.</p>
        <Button variant="outline" className="w-full" onClick={requestWithdrawal} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <ArrowUpFromLine />} Solicitar retiro</Button>
      </CardContent></Card>
    </div>
    {message && <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">{message}</p>}
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle>Historial de depósitos</CardTitle></CardHeader><CardContent>{loading ? <p className="text-sm text-slate-500">Cargando…</p> : deposits.length === 0 ? <Empty text="Todavía no hay depósitos registrados." /> : <div className="space-y-3">{deposits.map(d => <div key={d.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="font-semibold">{money(d.amount)}</p><p className="text-xs text-slate-500">{d.method} · {date(d.created_at)}</p></div><Status value={d.status} /></div>)}</div>}</CardContent></Card>
      <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle>Historial de retiros</CardTitle></CardHeader><CardContent>{loading ? <p className="text-sm text-slate-500">Cargando…</p> : withdrawals.length === 0 ? <Empty text="Todavía no hay retiros registrados." /> : <div className="space-y-3">{withdrawals.map(w => <div key={w.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="font-semibold">{money(w.amount)}</p><p className="text-xs text-slate-500">{w.method} · {date(w.created_at)}</p></div><Status value={w.status} /></div>)}</div>}</CardContent></Card>
    </div>
    <p className="text-xs text-slate-500">Modo DEMO: estas solicitudes registran movimientos en Supabase, pero no procesan pagos reales ni transfieren fondos automáticamente.</p>
  </div>;
}

function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">{text}</div>; }
