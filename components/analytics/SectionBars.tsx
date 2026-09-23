import type { Category } from "@prisma/client";

import { sectionForCategory } from "@/lib/sections";

/**
 * Views per section. Magnitude, not identity, so one hue: darker-is-bigger
 * would be a value ramp on names, and the section hues mean something else.
 */
export function SectionBars({ data }: { data: { category: Category; views: number }[] }) {
  const rows = [...data].sort((a, b) => b.views - a.views);
  const max = Math.max(1, ...rows.map((row) => row.views));

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const section = sectionForCategory(row.category);
        return (
          <li key={row.category} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
            <span className="truncate text-xs text-muted-foreground">{section.title}</span>
            <span className="h-4 w-full overflow-hidden rounded-sm">
              <span
                className="block h-4 rounded-r-[4px]"
                style={{
                  width: `${Math.max(row.views === 0 ? 0 : 2, (row.views / max) * 100)}%`,
                  background: "var(--series-1)",
                }}
              />
            </span>
            <span className="text-xs font-medium tabular-nums text-foreground">
              {row.views.toLocaleString("en-US")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
