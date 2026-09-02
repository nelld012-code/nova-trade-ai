import { createFileRoute } from "@tanstack/react-router";
import { FundsPanel } from "@/components/dashboard/FundsPanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";

export const Route = createFileRoute("/dashboard/fondos")({ beforeLoad: requireDashboardSession, component: FundsPage });
function FundsPage() {
  const { session } = Route.useRouteContext();
  return <DashboardPageLayout title="Fondos" description="Solicita depósitos y retiros y consulta sus movimientos."><FundsPanel userId={session.user.id} /></DashboardPageLayout>;
}
