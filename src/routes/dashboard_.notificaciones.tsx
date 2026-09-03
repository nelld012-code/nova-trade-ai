import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";
export const Route = createFileRoute("/dashboard_/notificaciones")({ beforeLoad: requireDashboardSession, component: NotificationsPage });
function NotificationsPage() { const { session } = Route.useRouteContext(); return <DashboardPageLayout title={{ es:"Notificaciones", en:"Notifications" }} description={{ es:"Revisa alertas, avisos y novedades de tu cuenta.", en:"Review alerts, notices, and updates for your account." }}><NotificationsPanel userId={session.user.id} /></DashboardPageLayout>; }
