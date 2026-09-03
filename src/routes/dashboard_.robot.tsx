import { createFileRoute } from "@tanstack/react-router";
import { RobotConfig } from "@/components/dashboard/RobotConfig";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";
export const Route = createFileRoute("/dashboard/robot")({ beforeLoad: requireDashboardSession, component: RobotPage });
function RobotPage() { const { session } = Route.useRouteContext(); return <DashboardPageLayout title={{ es:"Robot IA", en:"AI Robot" }} description={{ es:"Configura y controla tu estrategia automatizada en modo DEMO.", en:"Configure and control your automated strategy in DEMO mode." }}><RobotConfig userId={session.user.id} /></DashboardPageLayout>; }
