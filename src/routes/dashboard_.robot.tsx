import { createFileRoute } from "@tanstack/react-router";
import { DemoExecutionPanel } from "@/components/dashboard/DemoExecutionPanel";
import { RiskControlsPanel } from "@/components/dashboard/RiskControlsPanel";
import { RobotConfig } from "@/components/dashboard/RobotConfig";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";

export const Route = createFileRoute("/dashboard_/robot")({ beforeLoad: requireDashboardSession, component: RobotPage });

function RobotPage() {
  const { session } = Route.useRouteContext();
  return <DashboardPageLayout title={{ es: "Robot IA", en: "AI Robot" }} description={{ es: "Configura y controla tu estrategia automatizada en modo DEMO.", en: "Configure and control your automated strategy in DEMO mode." }}>
    <div className="space-y-6">
      <RobotConfig userId={session.user.id} />
      <RiskControlsPanel userId={session.user.id} />
      <DemoExecutionPanel userId={session.user.id} />
    </div>
  </DashboardPageLayout>;
}
