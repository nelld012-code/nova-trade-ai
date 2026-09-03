import { createFileRoute } from "@tanstack/react-router";
import { ProfilePagePanel } from "@/components/dashboard/ProfilePagePanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";
export const Route = createFileRoute("/dashboard_/perfil")({ beforeLoad: requireDashboardSession, component: ProfilePage });
function ProfilePage() { const { session } = Route.useRouteContext(); return <DashboardPageLayout title={{ es:"Mi Perfil", en:"My Profile" }} description={{ es:"Administra tus datos personales y la información de tu cuenta.", en:"Manage your personal details and account information." }}><ProfilePagePanel userId={session.user.id} email={session.user.email} /></DashboardPageLayout>; }
