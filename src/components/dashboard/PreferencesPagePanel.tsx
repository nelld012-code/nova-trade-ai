import { useEffect, useState } from "react";
import { Save, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/i18n";

type Settings = {
  language: "es" | "en";
  currency: "USD" | "BRL" | "EUR";
  theme: "dark" | "light" | "system";
  email_notifications: boolean;
  push_notifications: boolean;
  risk_alerts: boolean;
  two_factor_enabled: boolean;
};

const defaults: Settings = {
  language: "es",
  currency: "USD",
  theme: "dark",
  email_notifications: true,
  push_notifications: false,
  risk_alerts: true,
  two_factor_enabled: false,
};

function normalizeSettings(data: Partial<Settings> | null | undefined): Settings {
  return {
    ...defaults,
    ...data,
    language: data?.language === "en" ? "en" : "es",
    currency: data?.currency === "BRL" || data?.currency === "EUR" ? data.currency : "USD",
    theme: data?.theme === "light" || data?.theme === "system" ? data.theme : "dark",
  };
}

export function PreferencesPagePanel({ userId }: { userId: string }) {
  const { language, setLanguage } = useLanguage();
  const en = language === "en";
  const m = en
    ? {
        title: "Preferences",
        desc: "Configure your Trade Nova AI experience. This page contains no personal data or password changes.",
        lang: "Language",
        currency: "Currency",
        theme: "Theme",
        usd: "USD — US Dollar",
        brl: "BRL — Brazilian Real",
        eur: "EUR — Euro",
        dark: "Dark",
        light: "Light",
        system: "System",
        email: "Email notifications",
        emailDesc: "Important updates about your account.",
        push: "Push notifications",
        pushDesc: "Real-time alerts when available.",
        risk: "Risk alerts",
        riskDesc: "Relevant changes in risk and activity.",
        save: "Save preferences",
        saving: "Saving...",
        ok: "Preferences saved successfully.",
        error: "Unable to save preferences.",
      }
    : {
        title: "Preferencias",
        desc: "Configura la experiencia de Trade Nova AI. Esta página no contiene datos personales ni cambio de contraseña.",
        lang: "Idioma",
        currency: "Moneda",
        theme: "Tema",
        usd: "USD — Dólar estadounidense",
        brl: "BRL — Real brasileño",
        eur: "EUR — Euro",
        dark: "Oscuro",
        light: "Claro",
        system: "Sistema",
        email: "Notificaciones por email",
        emailDesc: "Actualizaciones importantes de tu cuenta.",
        push: "Notificaciones push",
        pushDesc: "Avisos en tiempo real cuando estén disponibles.",
        risk: "Alertas de riesgo",
        riskDesc: "Cambios relevantes de riesgo y actividad.",
        save: "Guardar preferencias",
        saving: "Guardando...",
        ok: "Preferencias guardadas correctamente.",
        error: "No se pudieron guardar las preferencias.",
      };

  const [settings, setSettings] = useState<Settings>(defaults);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: loadError } = await supabase
        .from("settings")
        .select("language,currency,theme,email_notifications,push_notifications,risk_alerts,two_factor_enabled")
        .eq("user_id", userId)
        .maybeSingle();
      if (!active) return;
      if (loadError) {
        setError(loadError.message);
        return;
      }
      if (data) setSettings(normalizeSettings(data));
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    const { error: saveError } = await supabase.from("settings").upsert({ user_id: userId, ...settings });
    setSaving(false);
    if (saveError) {
      setError(saveError.message || m.error);
      return;
    }
    setMessage(m.ok);
    setLanguage(settings.language);
  }

  const switches = [
    ["email_notifications", m.email, m.emailDesc],
    ["push_notifications", m.push, m.pushDesc],
    ["risk_alerts", m.risk, m.riskDesc],
  ] as const;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600"><SlidersHorizontal className="h-5 w-5" /></div>
          <div><CardTitle>{m.title}</CardTitle><CardDescription>{m.desc}</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2"><label className="text-sm font-medium">{m.lang}</label><select value={settings.language} onChange={e => { const value = e.target.value === "en" ? "en" : "es"; setSettings({ ...settings, language: value }); setLanguage(value); }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="es">Español</option><option value="en">English</option></select></div>
          <div className="space-y-2"><label className="text-sm font-medium">{m.currency}</label><select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value as Settings["currency"] })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="USD">{m.usd}</option><option value="BRL">{m.brl}</option><option value="EUR">{m.eur}</option></select></div>
          <div className="space-y-2"><label className="text-sm font-medium">{m.theme}</label><select value={settings.theme} onChange={e => setSettings({ ...settings, theme: e.target.value as Settings["theme"] })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="dark">{m.dark}</option><option value="light">{m.light}</option><option value="system">{m.system}</option></select></div>
        </div>
        <div className="divide-y rounded-xl border">
          {switches.map(([key, title, desc]) => <div key={key} className="flex items-center justify-between gap-4 p-4"><div><p className="text-sm font-medium">{title}</p><p className="text-xs text-slate-500">{desc}</p></div><Switch checked={settings[key]} onCheckedChange={checked => setSettings({ ...settings, [key]: checked })} /></div>)}
        </div>
        <Button onClick={save} disabled={saving}><Save />{saving ? m.saving : m.save}</Button>
      </CardContent>
    </Card>
  );
}
