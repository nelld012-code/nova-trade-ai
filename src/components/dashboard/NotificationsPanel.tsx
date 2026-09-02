import { useEffect, useState } from "react";
import { Bell, CheckCheck, CircleAlert, Info, ShieldAlert, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Notification = { id: string; type: string; title: string; message: string; is_read: boolean; created_at: string };

function iconFor(type: string) {
  if (type === "RISK" || type === "ALERT") return ShieldAlert;
  if (type === "WARNING") return CircleAlert;
  return Info;
}

export function NotificationsPanel({ userId }: { userId: string }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data, error: queryError } = await supabase.from("notifications").select("id,type,title,message,is_read,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
    if (queryError) setError("No fue posible cargar las notificaciones.");
    else { setError(""); setItems(data ?? []); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [userId]);

  async function markRead(id: string) {
    setBusy(true);
    const { error: updateError } = await supabase.from("notifications").update({ is_read: true }).eq("id", id).eq("user_id", userId);
    if (!updateError) setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item));
    else setError("No fue posible actualizar la notificación.");
    setBusy(false);
  }

  async function markAllRead() {
    setBusy(true);
    const { error: updateError } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    if (!updateError) setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    else setError("No fue posible marcar todas como leídas.");
    setBusy(false);
  }

  const unread = items.filter((item) => !item.is_read).length;

  return (
    <Card id="notificaciones" className="scroll-mt-24 border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-blue-600" /> Notificaciones {unread > 0 && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{unread}</span>}</CardTitle><p className="mt-1 text-sm text-slate-500">Alertas y novedades de tu cuenta.</p></div>
        {unread > 0 && <Button variant="outline" size="sm" onClick={markAllRead} disabled={busy}><CheckCheck className="mr-2 h-4 w-4" /> Marcar todas</Button>}
      </CardHeader>
      <CardContent>
        {error && <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><span>{error}</span><button aria-label="Cerrar" onClick={() => setError("")}><X className="h-4 w-4" /></button></div>}
        {loading ? <div className="py-8 text-center text-sm text-slate-500">Cargando notificaciones…</div> : items.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center"><Bell className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-medium">No tienes notificaciones</p><p className="mt-1 text-sm text-slate-500">Aquí aparecerán alertas importantes de TradeNova AI.</p></div> : <div className="space-y-2">{items.map((item) => { const Icon = iconFor(item.type); return <div key={item.id} className={`rounded-xl border p-4 transition ${item.is_read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/50"}`}><div className="flex gap-3"><div className="mt-0.5 rounded-lg bg-slate-100 p-2"><Icon className="h-4 w-4 text-slate-700" /></div><div className="min-w-0 flex-1"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="font-semibold text-slate-900">{item.title}</p><time className="text-xs text-slate-500">{new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}</time></div><p className="mt-1 text-sm text-slate-600">{item.message}</p>{!item.is_read && <Button variant="ghost" size="sm" className="mt-2 px-0 text-blue-600 hover:bg-transparent hover:text-blue-700" onClick={() => markRead(item.id)} disabled={busy}>Marcar como leída</Button>}</div></div></div>; })}</div>}
      </CardContent>
    </Card>
  );
}
