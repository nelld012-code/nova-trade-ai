import { useEffect, useState, type ReactNode } from "react";
import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useLanguage } from "@/lib/i18n";

type Props = { children: ReactNode; title: string | { es: string; en: string }; description?: string | { es: string; en: string } };

export async function requireDashboardSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw redirect({ to: "/login" });
  return { session };
}

export function DashboardPageLayout({ children, title, description }: Props) {
  const { language } = useLanguage();
  const en = language === "en";
  const resolve = (value?: string | { es: string; en: string }) => typeof value === "string" ? value : value ? (en ? value.en : value.es) : undefined;
  const [session, setSession] = useState<Awaited<ReturnType<typeof requireDashboardSession>>["session"] | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string | null; avatar_url?: string | null; country?: string | null } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) return;
      const db = supabase as any;
      const { data } = await db.from("profiles").select("full_name,avatar_url,country").eq("id", currentSession.user.id).maybeSingle();
      if (!active) return;
      setSession(currentSession);
      setProfile(data || null);
    }
    void load();
    return () => { active = false; };
  }, []);

  if (!session) return <div className="min-h-screen bg-slate-50" />;
  const resolvedTitle = resolve(title) ?? "";
  const resolvedDescription = resolve(description);

  return (
    <DashboardShell email={session.user.email} userName={profile?.full_name || undefined} avatarUrl={profile?.avatar_url || null} countryCode={profile?.country || ""}>
      <section className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-medium text-blue-600">TRADE NOVA AI</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{resolvedTitle}</h1>
          {resolvedDescription && <p className="mt-1 text-sm text-slate-500">{resolvedDescription}</p>}
        </div>
        {children}
      </section>
    </DashboardShell>
  );
}

export function useDashboardUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setUserId(session?.user.id || null);
    });
    return () => { active = false; };
  }, []);
  return userId;
}
