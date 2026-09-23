import type { ReactNode } from "react";

/**
 * A chart with its title and a collapsed data table. Every value in a chart is
 * also reachable as text, so nothing depends on hovering or on seeing colour.
 */
export function ChartCard({
  title,
  subtitle,
  children,
  tableHeadings,
  tableRows,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  tableHeadings: string[];
  tableRows: (string | number)[][];
}) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {children}

      <details className="mt-4 border-t pt-3">
        <summary className="cursor-pointer text-xs text-muted-foreground">Show data</summary>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-card text-muted-foreground">
              <tr>
                {tableHeadings.map((heading) => (
                  <th key={heading} className="py-1 pr-4 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {tableRows.map((row, i) => (
                <tr key={i} className="border-t">
                  {row.map((cell, j) => (
                    <td key={j} className="py-1 pr-4">
                      {typeof cell === "number" ? cell.toLocaleString("en-US") : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
