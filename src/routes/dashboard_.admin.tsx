import { createFileRoute } from "@tanstack/react-router";
import { AdminUserRolesPanel } from "@/components/dashboard/AdminUserRolesPanel";
import { AdminPortfolioControl } from "@/components/dashboard/AdminPortfolioControl";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";

export const Route = createFileRoute("/dashboard/admin")({ beforeLoad: requireDashboardSession, component: AdminPage });
function AdminPage() { const { session } = Route.useRouteContext(); return <DashboardPageLayout title={{ es:"Administración", en:"Administration" }} description={{ es:"Gestiona usuarios, roles y controles administrativos de la plataforma.", en:"Manage users, roles, and administrative controls for the platform." }}><AdminUserRolesPanel userId={session.user.id} /><AdminPortfolioControl userId={session.user.id} /></DashboardPageLayout>; }
