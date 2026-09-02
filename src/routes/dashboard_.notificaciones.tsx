import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";

export const Route = createFileRoute("/dashboard/notificaciones")({ beforeLoad: requireDashboardSession, component: NotificationsPage });
function NotificationsPage() {
  const { session } = Route.useRouteContext();
  return <DashboardPageLayout title="Notificaciones" description="Revisa alertas, avisos y novedades de tu cuenta."><NotificationsPanel userId={session.user.id} /></DashboardPageLayout>;
}
