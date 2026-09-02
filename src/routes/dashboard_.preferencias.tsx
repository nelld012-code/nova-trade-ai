import { createFileRoute } from "@tanstack/react-router";
import { ProfileSettingsPanel } from "@/components/dashboard/ProfileSettingsPanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";

export const Route = createFileRoute("/dashboard/preferencias")({ beforeLoad: requireDashboardSession, component: PreferencesPage });
function PreferencesPage() {
  const { session } = Route.useRouteContext();
  return <DashboardPageLayout title="Preferencias" description="Configura idioma, moneda, tema y tus preferencias de notificaciones."><ProfileSettingsPanel userId={session.user.id} email={session.user.email} /></DashboardPageLayout>;
}
