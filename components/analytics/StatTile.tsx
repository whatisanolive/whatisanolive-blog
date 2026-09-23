import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import type { Kpi } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const compact = (n: number) =>
  n.toLocaleString("en-US", { notation: n >= 10_000 ? "compact" : "standard" });

/** Label, value, and change against the previous period of the same length. */
export function StatTile({
  label,
  kpi,
  rangeLabel,
}: {
  label: string;
  kpi: Kpi;
  rangeLabel: string;
}) {
  const diff = kpi.current - kpi.previous;
  const pct = kpi.previous === 0 ? null : Math.round((diff / kpi.previous) * 100);

  const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : ArrowRight;
  const tone =
    diff > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : diff < 0
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  const change =
    kpi.previous === 0
      ? kpi.current === 0
        ? "No change"
        : "New"
      : `${diff > 0 ? "+" : ""}${pct}%`;

  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-foreground">{compact(kpi.current)}</p>
      <p className={cn("mt-2 flex items-center gap-1 text-xs", tone)}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
        <span className="font-medium">{change}</span>
        <span className="text-muted-foreground">vs previous {rangeLabel}</span>
      </p>
    </div>
  );
}
