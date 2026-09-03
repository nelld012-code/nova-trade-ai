import { createFileRoute } from "@tanstack/react-router";
import { SecurityPagePanel } from "@/components/dashboard/SecurityPagePanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";
export const Route = createFileRoute("/dashboard_/seguridad")({ beforeLoad: requireDashboardSession, component: SecurityPage });
function SecurityPage() { const { session } = Route.useRouteContext(); return <DashboardPageLayout title={{ es:"Seguridad", en:"Security" }} description={{ es:"Gestiona tu contraseña y las opciones de seguridad disponibles.", en:"Manage your password and available security options." }}><SecurityPagePanel userId={session.user.id} /></DashboardPageLayout>; }
