import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PortfolioPanel } from "@/components/dashboard/PortfolioPanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_EXECUTION_EVENT } from "@/lib/demo-events";
type Portfolio = { balance: number; invested: number; performance_pct: number; today_pnl: number; total_deposited: number; total_pnl: number };
const demoPortfolio: Portfolio = { balance: 12480, invested: 10000, performance_pct: 24.8, today_pnl: 186.4, total_deposited: 10000, total_pnl: 2480 };
export const Route = createFileRoute("/dashboard/portafolio")({ beforeLoad: requireDashboardSession, component: PortfolioPage });
function PortfolioPage() { const { session } = Route.useRouteContext(); const [portfolio, setPortfolio] = useState<Portfolio>(demoPortfolio); useEffect(() => { let active = true; const load = async () => { const { data } = await supabase.from("portfolio").select("balance,invested,performance_pct,today_pnl,total_deposited,total_pnl").eq("user_id", session.user.id).maybeSingle(); if (active && data) setPortfolio(data); }; void load(); const refresh = () => { void load(); }; window.addEventListener(DEMO_EXECUTION_EVENT, refresh); return () => { active = false; window.removeEventListener(DEMO_EXECUTION_EVENT, refresh); }; }, [session.user.id]); return <DashboardPageLayout title={{ es:"Portafolio", en:"Portfolio" }} description={{ es:"Visualiza tu capital, rendimiento y resultados acumulados.", en:"View your capital, performance, and accumulated results." }}><PortfolioPanel portfolio={portfolio} /></DashboardPageLayout>; }
