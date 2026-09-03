import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PortfolioPanel } from "@/components/dashboard/PortfolioPanel";
import { DashboardPageLayout, requireDashboardSession } from "@/components/dashboard/DashboardPageLayout";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_EXECUTION_EVENT } from "@/lib/demo-events";
type Portfolio = { balance:number; invested:number; performance_pct:number; today_pnl:number; total_deposited:number; total_pnl:number };
const emptyPortfolio: Portfolio = { balance:0, invested:0, performance_pct:0, today_pnl:0, total_deposited:0, total_pnl:0 };
export const Route = createFileRoute("/dashboard_/portafolio")({ beforeLoad: requireDashboardSession, component: PortfolioPage });
function PortfolioPage() { const { session } = Route.useRouteContext(); const [portfolio,setPortfolio]=useState<Portfolio>(emptyPortfolio); const [hasPortfolio,setHasPortfolio]=useState(false); useEffect(()=>{let active=true; const load=async()=>{const {data}=await supabase.from("portfolio").select("balance,invested,performance_pct,today_pnl,total_deposited,total_pnl").eq("user_id",session.user.id).maybeSingle(); if(!active)return; if(data){setPortfolio(data);setHasPortfolio(true)}else{setPortfolio(emptyPortfolio);setHasPortfolio(false)}}; void load(); const refresh=()=>{void load()}; window.addEventListener(DEMO_EXECUTION_EVENT,refresh); return()=>{active=false;window.removeEventListener(DEMO_EXECUTION_EVENT,refresh)}},[session.user.id]); return <DashboardPageLayout title={{es:"Portafolio",en:"Portfolio"}} description={{es:"Visualiza tu capital, rendimiento y resultados acumulados.",en:"View your capital, performance, and accumulated results."}}><PortfolioPanel portfolio={portfolio} hasPortfolio={hasPortfolio} userId={session.user.id}/></DashboardPageLayout>; }
