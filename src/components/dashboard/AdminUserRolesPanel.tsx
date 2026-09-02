import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck, UserCog, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Role = "admin" | "moderator" | "user";
type AdminUser = { user_id: string; full_name: string | null; email: string; country: string | null; role: Role };

const roleLabel: Record<Role, string> = { admin: "Administrador", moderator: "Moderador", user: "Usuario" };

export function AdminUserRolesPanel({ userId }: { userId: string }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    setError(null);
    const db = supabase as any;
    const { data, error: listError } = await db.rpc("admin_list_users");
    if (listError) { setError(listError.message); return; }
    setUsers((data ?? []) as AdminUser[]);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      const db = supabase as any;
      const { data, error: roleError } = await db.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (!active) return;
      const allowed = !roleError && data === true;
      setIsAdmin(allowed);
      setChecking(false);
      if (allowed) {
        setLoading(true);
        const { data: list, error: listError } = await db.rpc("admin_list_users");
        if (active) {
          if (listError) setError(listError.message);
          else setUsers((list ?? []) as AdminUser[]);
          setLoading(false);
        }
      }
    }
    void load();
    return () => { active = false; };
  }, [userId]);

  if (checking || !isAdmin) return null;

  async function setRole(targetUserId: string, role: Role) {
    setMessage(null); setError(null); setSavingUser(targetUserId);
    const db = supabase as any;
    const { error: roleError } = await db.rpc("admin_set_user_role", { target_user_id: targetUserId, new_role: role });
    setSavingUser(null);
    if (roleError) { setError(roleError.message); return; }
    setMessage("Rol actualizado correctamente.");
    await loadUsers();
  }

  return <Card id="usuarios-roles" className="border-violet-200 bg-violet-50/30 shadow-sm">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-violet-600 p-2 text-white"><UserCog className="h-5 w-5" /></div>
        <div><CardTitle>Administración → Usuarios y Roles</CardTitle><CardDescription>Solo visible para administradores. Gestiona quién puede ser Usuario, Moderador o Administrador.</CardDescription></div>
      </div>
    </CardHeader>
    <CardContent className="space-y-5">
      {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{message}</div>}
      {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</div>}
      <div className="flex items-center justify-between rounded-xl border bg-white p-4"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-violet-600" /><div><p className="font-semibold">Usuarios registrados</p><p className="text-xs text-slate-500">{users.length} cuenta{users.length === 1 ? "" : "s"} disponible{users.length === 1 ? "" : "s"}</p></div></div><ShieldCheck className="h-5 w-5 text-emerald-600" /></div>
      {loading ? <p className="text-sm text-slate-500">Cargando usuarios...</p> : <div className="space-y-3">
        {users.map((user) => <div key={user.user_id} className="flex flex-col gap-4 rounded-xl border bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0"><p className="truncate font-semibold">{user.full_name || "Sin nombre"}</p><p className="truncate text-sm text-slate-500">{user.email}</p><p className="mt-1 text-xs text-slate-400">Rol actual: <strong>{roleLabel[user.role]}</strong>{user.country ? ` · ${user.country}` : ""}</p></div>
          <div className="flex flex-wrap gap-2">
            {(["user", "moderator", "admin"] as Role[]).map((role) => <Button key={role} size="sm" variant={user.role === role ? "default" : "outline"} disabled={savingUser === user.user_id || user.user_id === userId && role !== "admin"} onClick={() => void setRole(user.user_id, role)}>{roleLabel[role]}</Button>)}
          </div>
        </div>)}
      </div>}
      <p className="text-xs text-slate-500">Protección: el sistema impide eliminar al último administrador y no permite que el administrador principal se quite sus propios permisos desde este panel.</p>
    </CardContent>
  </Card>;
}
