import { useQuery } from "@tanstack/react-query";
import { metricsQuery } from "@/services/publicData";
import { Skeleton } from "@/components/ui/skeleton";

export function MetricsSection() {
  const { data, isLoading } = useQuery(metricsQuery);

  return (
    <section className="border-y border-border bg-neutral-surface">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : (data ?? []).map((metric) => (
              <div
                key={metric.id}
                className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-soft)]"
              >
                <p className="eyebrow text-muted-foreground">{metric.label}</p>
                <p className="mt-3 text-3xl font-extrabold text-foreground">{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
              </div>
            ))}
      </div>
    </section>
  );
}
