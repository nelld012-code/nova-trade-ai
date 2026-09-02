import { createFileRoute } from "@tanstack/react-router";
import { SecurityPagePanel } from "@/components/dashboard/SecurityPagePanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";
export const Route = createFileRoute("/dashboard/seguridad")({ beforeLoad: requireDashboardSession, component: SecurityPage });
function SecurityPage() { const { session } = Route.useRouteContext(); return <DashboardPageLayout title="Seguridad" description="Gestiona tu contraseña y las opciones de seguridad disponibles."><SecurityPagePanel userId={session.user.id} /></DashboardPageLayout>; }
