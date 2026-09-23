"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ReactNode } from "react";

import { RANGE_OPTIONS, type RangeDays } from "@/lib/analytics-range";
import { cn } from "@/lib/utils";

/**
 * Date range for everything below it. While the new range loads the content
 * keeps its previous render at reduced opacity, so there's no skeleton flash.
 */
export function RangeFilter({ range, children }: { range: RangeDays; children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const select = (value: RangeDays) => {
    const params = new URLSearchParams(searchParams);
    params.set("range", String(value));
    startTransition(() => router.push(`?${params}`, { scroll: false }));
  };

  return (
    <>
      <div className="mb-6 flex items-center gap-1 rounded-full border bg-card p-1 w-fit">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => select(option)}
            aria-pressed={option === range}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs transition-colors",
              option === range
                ? "bg-secondary font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Last {option} days
          </button>
        ))}
      </div>

      <div className={cn("transition-opacity", isPending && "opacity-60")}>{children}</div>
    </>
  );
}
