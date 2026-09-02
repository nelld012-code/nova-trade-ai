import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OperationsPanel } from "@/components/dashboard/OperationsPanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";
import { supabase } from "@/integrations/supabase/client";

type Operation = { id: string; asset: string; direction: string; entry_price: number; exit_price: number | null; pnl: number; return_pct: number; size: number; status: string; opened_at: string; closed_at: string | null };
export const Route = createFileRoute("/dashboard/operaciones")({ beforeLoad: requireDashboardSession, component: OperationsPage });
function OperationsPage() {
  const { session } = Route.useRouteContext();
  const [operations, setOperations] = useState<Operation[]>([]);
  useEffect(() => { let active = true; supabase.from("operations").select("id,asset,direction,entry_price,exit_price,pnl,return_pct,size,status,opened_at,closed_at").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(50).then(({ data }) => { if (active && data) setOperations(data); }); return () => { active = false; }; }, [session.user.id]);
  return <DashboardPageLayout title="Operaciones" description="Consulta el historial y estado de tus operaciones."><OperationsPanel operations={operations} /></DashboardPageLayout>;
}
