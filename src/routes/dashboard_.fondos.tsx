import { createFileRoute } from "@tanstack/react-router";
import { FundsPanel } from "@/components/dashboard/FundsPanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";
export const Route = createFileRoute("/dashboard_/fondos")({ beforeLoad: requireDashboardSession, component: FundsPage });
function FundsPage() { const { session } = Route.useRouteContext(); return <DashboardPageLayout title={{ es:"Fondos", en:"Funds" }} description={{ es:"Solicita depósitos y retiros y consulta sus movimientos.", en:"Request deposits and withdrawals and review their activity." }}><FundsPanel userId={session.user.id} /></DashboardPageLayout>; }
