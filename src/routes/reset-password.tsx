import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({ component: ResetPasswordPage });

function ResetPasswordPage() {
  const { language } = useLanguage();
  const en = language === "en";
  const [ready, setReady] = useState(false); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { let active = true; supabase.auth.getSession().then(({ data }) => { if (active) setReady(Boolean(data.session)); }); const { data: listener } = supabase.auth.onAuthStateChange((event, session) => { if (active && (event === "PASSWORD_RECOVERY" || session)) setReady(true); }); return () => { active = false; listener.subscription.unsubscribe(); }; }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (!ready) return setError(en ? "The recovery link is invalid or has expired. Request a new one." : "El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.");
    if (password.length < 8) return setError(en ? "Password must be at least 8 characters." : "La contraseña debe tener al menos 8 caracteres.");
    if (password !== confirm) return setError(en ? "Passwords do not match." : "Las contraseñas no coinciden.");
    setSaving(true); const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message); else { setMessage(en ? "Password updated successfully. You can now sign in with your new password." : "Contraseña actualizada correctamente. Ya puedes entrar con tu nueva contraseña."); setPassword(""); setConfirm(""); } setSaving(false);
  }
  return <AuthShell title={en ? "New password" : "Nueva contraseña"} description={en ? "Create a secure password to protect your TradeNova AI account." : "Crea una contraseña segura para proteger tu cuenta de TradeNova AI."}>
    <Card className="border-slate-200 shadow-sm"><CardContent className="p-6 sm:p-8"><form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800"><KeyRound className="h-5 w-5 shrink-0" /><span>{en ? "Use at least 8 characters and avoid easy-to-guess passwords." : "Usa al menos 8 caracteres y evita contraseñas fáciles de adivinar."}</span></div>
      <div><label htmlFor="password" className="mb-2 block text-sm font-medium">{en ? "New password" : "Nueva contraseña"}</label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required /></div>
      <div><label htmlFor="confirm" className="mb-2 block text-sm font-medium">{en ? "Confirm password" : "Confirmar contraseña"}</label><Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required /></div>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <Button className="w-full" type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{en ? "Update password" : "Actualizar contraseña"}</Button>
      <p className="text-center text-xs text-slate-500">{en ? "If the link expired, return to “Forgot my password” to generate a new one." : "Si el enlace expiró, vuelve a “Olvidé mi contraseña” para generar uno nuevo."}</p>
    </form></CardContent></Card>
  </AuthShell>;
}
