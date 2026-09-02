import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, KeyRound, LockKeyhole, Save, ShieldCheck, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type Settings = {
  language: string;
  currency: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  risk_alerts: boolean;
  two_factor_enabled: boolean;
};

const defaultSettings: Settings = {
  language: "es",
  currency: "USD",
  theme: "dark",
  email_notifications: true,
  push_notifications: false,
  risk_alerts: true,
  two_factor_enabled: false,
};

export function ProfileSettingsPanel({ userId, email }: { userId: string; email?: string | null }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const [{ data: profile }, { data: saved }] = await Promise.all([
        supabase.from("profiles").select("full_name,phone").eq("id", userId).maybeSingle(),
        supabase.from("settings").select("language,currency,theme,email_notifications,push_notifications,risk_alerts,two_factor_enabled").eq("user_id", userId).maybeSingle(),
      ]);
      if (!active) return;
      if (profile) {
        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
      }
      if (saved) setSettings(saved);
    }
    load();
    return () => { active = false; };
  }, [userId]);

  const clearStatus = () => { setMessage(null); setError(null); };

  async function saveProfile() {
    clearStatus();
    if (!fullName.trim()) { setError("El nombre completo es obligatorio."); return; }
    setSavingProfile(true);
    const { error: saveError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName.trim(),
      email: email ?? "",
      phone: phone.trim() || null,
    });
    setSavingProfile(false);
    if (saveError) setError(saveError.message);
    else setMessage("Perfil actualizado correctamente.");
  }

  async function saveSettings() {
    clearStatus();
    setSavingSettings(true);
    const { error: saveError } = await supabase.from("settings").upsert({ user_id: userId, ...settings });
    setSavingSettings(false);
    if (saveError) setError(saveError.message);
    else setMessage("Preferencias guardadas correctamente.");
  }

  async function changePassword() {
    clearStatus();
    if (newPassword.length < 8) { setError("La nueva contraseña debe tener al menos 8 caracteres."); return; }
    if (newPassword !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    setChangingPassword(true);
    const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (passwordError) setError(passwordError.message);
    else { setNewPassword(""); setConfirmPassword(""); setMessage("Contraseña actualizada correctamente."); }
  }

  const toggle = (key: keyof Pick<Settings, "email_notifications" | "push_notifications" | "risk_alerts">) =>
    setSettings((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="space-y-6">
      {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{message}</div>}
      {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</div>}

      <Card id="perfil" className="border-slate-200 shadow-sm">
        <CardHeader><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-2 text-blue-600"><UserRound className="h-5 w-5" /></div><div><CardTitle>Perfil personal</CardTitle><CardDescription>Actualiza los datos visibles de tu cuenta.</CardDescription></div></div></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2"><label className="text-sm font-medium">Nombre completo</label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Correo electrónico</label><Input value={email ?? ""} disabled className="bg-slate-50" /><p className="text-xs text-slate-500">El correo se gestiona desde autenticación.</p></div>
          <div className="space-y-2"><label className="text-sm font-medium">Teléfono</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 ..." /></div>
          <div className="flex items-end"><Button onClick={saveProfile} disabled={savingProfile}><Save />{savingProfile ? "Guardando..." : "Guardar perfil"}</Button></div>
        </CardContent>
      </Card>

      <Card id="preferencias" className="border-slate-200 shadow-sm">
        <CardHeader><CardTitle>Preferencias</CardTitle><CardDescription>Personaliza idioma, moneda, apariencia y avisos.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2"><label className="text-sm font-medium">Idioma</label><select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"><option value="es">Español</option><option value="pt-BR">Português (Brasil)</option><option value="en">English</option></select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Moneda</label><select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"><option value="USD">USD — Dólar</option><option value="BRL">BRL — Real</option><option value="EUR">EUR — Euro</option></select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Tema</label><select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"><option value="dark">Oscuro</option><option value="light">Claro</option><option value="system">Sistema</option></select></div>
          </div>
          <div className="divide-y rounded-xl border">
            {[ ["email_notifications", "Notificaciones por email", "Recibe actualizaciones importantes de tu cuenta."], ["push_notifications", "Notificaciones push", "Avisos en tiempo real cuando estén disponibles."], ["risk_alerts", "Alertas de riesgo", "Recibe avisos sobre cambios relevantes de riesgo."] ].map(([key, title, description]) => <div key={key} className="flex items-center justify-between gap-4 p-4"><div><p className="font-medium text-sm">{title}</p><p className="text-xs text-slate-500">{description}</p></div><Switch checked={settings[key as keyof Settings] as boolean} onCheckedChange={() => toggle(key as "email_notifications" | "push_notifications" | "risk_alerts")} /></div>)}
          </div>
          <Button onClick={saveSettings} disabled={savingSettings}><Save />{savingSettings ? "Guardando..." : "Guardar preferencias"}</Button>
        </CardContent>
      </Card>

      <Card id="seguridad" className="border-slate-200 shadow-sm">
        <CardHeader><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-2 text-emerald-600"><ShieldCheck className="h-5 w-5" /></div><div><CardTitle>Seguridad</CardTitle><CardDescription>Protege el acceso a tu cuenta.</CardDescription></div></div></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4"><div className="flex items-center gap-3"><LockKeyhole className="h-5 w-5 text-emerald-600" /><div><p className="font-medium">Contraseña</p><p className="text-xs text-slate-500">Protegida mediante Supabase Auth.</p></div></div></div>
            <div className="rounded-xl border p-4"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-slate-500" /><div><p className="font-medium">Autenticación de dos factores</p><p className="text-xs text-slate-500">{settings.two_factor_enabled ? "Configurada" : "No configurada"}. Esta fase muestra el estado sin activar MFA automáticamente.</p></div></div></div>
          </div>
          <div className="max-w-xl space-y-4 rounded-xl border p-4"><div className="flex items-center gap-2"><KeyRound className="h-4 w-4" /><p className="font-semibold">Cambiar contraseña</p></div><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña (mín. 8 caracteres)" autoComplete="new-password" /><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar nueva contraseña" autoComplete="new-password" /><Button onClick={changePassword} disabled={changingPassword}>{changingPassword ? "Actualizando..." : "Actualizar contraseña"}</Button></div>
          <p className="text-xs text-slate-500">La autenticación de dos factores queda preparada como estado de configuración; no se presenta como activa si Supabase MFA todavía no está configurado.</p>
        </CardContent>
      </Card>
    </div>
  );
}
