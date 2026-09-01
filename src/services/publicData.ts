import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Plan, PlatformMetric } from "@/types";

export const plansQuery = queryOptions({
  queryKey: ["plans"],
  queryFn: async (): Promise<Plan[]> => {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      ...row,
      min_investment: Number(row.min_investment),
      features: Array.isArray(row.features) ? (row.features as string[]) : [],
    })) as Plan[];
  },
  staleTime: 5 * 60 * 1000,
});

export const metricsQuery = queryOptions({
  queryKey: ["platform_metrics"],
  queryFn: async (): Promise<PlatformMetric[]> => {
    const { data, error } = await supabase
      .from("platform_metrics")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as PlatformMetric[];
  },
  staleTime: 5 * 60 * 1000,
});
