import { createFileRoute } from "@tanstack/react-router";
import { ProfilePagePanel } from "@/components/dashboard/ProfilePagePanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";
export const Route = createFileRoute("/dashboard/perfil")({ beforeLoad: requireDashboardSession, component: ProfilePage });
function ProfilePage() { const { session } = Route.useRouteContext(); return <DashboardPageLayout title="Mi Perfil" description="Administra tus datos personales y la información de tu cuenta."><ProfilePagePanel userId={session.user.id} email={session.user.email} /></DashboardPageLayout>; }
