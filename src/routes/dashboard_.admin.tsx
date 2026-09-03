import { createFileRoute } from "@tanstack/react-router";
import { AdminUserRolesPanel } from "@/components/dashboard/AdminUserRolesPanel";
import { AdminPortfolioControl } from "@/components/dashboard/AdminPortfolioControl";
import { AdminFinancePanel } from "@/components/dashboard/AdminFinancePanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";

export const Route = createFileRoute("/dashboard_/admin")({ beforeLoad: requireDashboardSession, component: AdminPage });
function AdminPage() { const { session } = Route.useRouteContext(); return <DashboardPageLayout title={{ es:"Administración", en:"Administration" }} description={{ es:"Gestiona usuarios, roles, valores financieros y solicitudes de fondos de la plataforma.", en:"Manage users, roles, financial values, and funding requests across the platform." }}><AdminUserRolesPanel userId={session.user.id} /><AdminPortfolioControl userId={session.user.id} /><AdminFinancePanel userId={session.user.id} /></DashboardPageLayout>; }
