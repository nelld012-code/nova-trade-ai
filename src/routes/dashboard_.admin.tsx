import { createFileRoute } from "@tanstack/react-router";
import { AdminUserRolesPanel } from "@/components/dashboard/AdminUserRolesPanel";
import { AdminPortfolioControl } from "@/components/dashboard/AdminPortfolioControl";
import { AdminFinancePanel } from "@/components/dashboard/AdminFinancePanel";
import { AdminRiskControlsPanel } from "@/components/dashboard/AdminRiskControlsPanel";
import { AdminAuditLogPanel } from "@/components/dashboard/AdminAuditLogPanel";
import { AdminSupportPanel } from "@/components/dashboard/AdminSupportPanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";

export const Route = createFileRoute("/dashboard_/admin")({ beforeLoad: requireDashboardSession, component: AdminPage });
function AdminPage() { const { session } = Route.useRouteContext(); return <DashboardPageLayout title={{ es:"Administración", en:"Administration" }} description={{ es:"Gestiona usuarios, roles, valores financieros, riesgo, solicitudes, soporte y auditoría de la plataforma.", en:"Manage users, roles, financial values, risk, requests, support, and platform auditing." }}><AdminUserRolesPanel userId={session.user.id} /><AdminPortfolioControl userId={session.user.id} /><AdminFinancePanel userId={session.user.id} /><AdminRiskControlsPanel userId={session.user.id} /><AdminAuditLogPanel userId={session.user.id} /><AdminSupportPanel userId={session.user.id} /></DashboardPageLayout>; }
