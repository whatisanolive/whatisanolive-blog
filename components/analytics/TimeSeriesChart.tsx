"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export type Series = {
  label: string;
  /** A CSS colour, e.g. "var(--series-1)". */
  color: string;
};

type TimeSeriesChartProps = {
  /** One entry per day; `values[i]` belongs to `series[i]`. */
  data: { date: string; values: number[] }[];
  series: Series[];
  ariaLabel: string;
  height?: number;
};

const MARGIN = { top: 12, right: 56, bottom: 28, left: 40 };

function niceStep(max: number, ticks: number) {
  const raw = Math.max(max, 1) / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  return Math.max(1, step);
}

const dateLabel = (key: string, withYear = false) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });

const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * Line chart for daily counts. One series gets an area wash; two or more get
 * a legend. A crosshair snaps to the nearest day on hover, and the arrow keys
 * move it when the chart has keyboard focus.
 */
export function TimeSeriesChart({ data, series, ariaLabel, height = 240 }: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;

  const { yMax, ticks } = useMemo(() => {
    const max = Math.max(0, ...data.flatMap((d) => d.values));
    const step = niceStep(max, 4);
    const top = Math.max(step * 4, Math.ceil(max / step) * step);
    const tickValues: number[] = [];
    for (let v = 0; v <= top; v += step) tickValues.push(v);
    return { yMax: top, ticks: tickValues };
  }, [data]);

  const n = data.length;
  const x = (i: number) => MARGIN.left + (n <= 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;

  const linePath = (s: number) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.values[s]).toFixed(1)}`).join("");
  const areaPath = (s: number) =>
    `${linePath(s)}L${x(n - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;

  // ~5 evenly spaced date labels, always including the last day.
  const xLabelIdx = useMemo(() => {
    if (n <= 1) return [0];
    const count = Math.min(5, n);
    return Array.from({ length: count }, (_, k) => Math.round((k * (n - 1)) / (count - 1)));
  }, [n]);

  const indexAt = (clientX: number, rect: DOMRect) => {
    const px = clientX - rect.left - MARGIN.left;
    return Math.min(n - 1, Math.max(0, Math.round((px / plotW) * (n - 1))));
  };

  const onPointerMove = (e: PointerEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (svg) setActive(indexAt(e.clientX, svg.getBoundingClientRect()));
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setActive((i) => {
        const start = i ?? n - 1;
        return Math.min(n - 1, Math.max(0, start + (e.key === "ArrowRight" ? 1 : -1)));
      });
    }
  };

  // Direct end labels, unless two of them would collide (the legend covers it then).
  const last = data[n - 1];
  const endYs = series.map((_, s) => (last ? y(last.values[s]) : 0));
  const endLabelsCollide = endYs.some((a, i) => endYs.some((b, j) => i < j && Math.abs(a - b) < 14));

  const activePoint = active !== null ? data[active] : null;
  const tooltipLeft = active !== null ? x(active) : 0;
  const flip = tooltipLeft > width - 180;

  return (
    <div>
      {series.length > 1 && (
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          {series.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}

      <div ref={containerRef} className="relative w-full">
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onFocus={() => setActive((i) => i ?? n - 1)}
          onBlur={() => setActive(null)}
          className="block overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md"
        >
          {/* Gridlines + y ticks */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + plotW}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--edge-soft)"
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="fill-muted-foreground text-[11px] tabular-nums"
              >
                {fmt(t)}
              </text>
            </g>
          ))}

          {/* X labels */}
          {xLabelIdx.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={height - 8}
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
              className="fill-muted-foreground text-[11px]"
            >
              {data[i] ? dateLabel(data[i].date) : ""}
            </text>
          ))}

          {/* Series */}
          {series.length === 1 && n > 1 && (
            <path d={areaPath(0)} fill={series[0].color} fillOpacity={0.1} />
          )}
          {series.map((s, si) => (
            <path
              key={s.label}
              d={linePath(si)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {/* End dots + direct labels */}
          {last &&
            series.map((s, si) => (
              <g key={s.label}>
                <circle cx={x(n - 1)} cy={endYs[si]} r={4} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
                {!endLabelsCollide && (
                  <text
                    x={x(n - 1) + 10}
                    y={endYs[si]}
                    dy="0.32em"
                    className="fill-foreground text-xs font-medium tabular-nums"
                  >
                    {fmt(last.values[si])}
                  </text>
                )}
              </g>
            ))}

          {/* Crosshair */}
          {activePoint && active !== null && (
            <g pointerEvents="none">
              <line
                x1={x(active)}
                x2={x(active)}
                y1={MARGIN.top}
                y2={MARGIN.top + plotH}
                stroke="var(--edge)"
                strokeWidth={1}
              />
              {series.map((s, si) => (
                <circle
                  key={s.label}
                  cx={x(active)}
                  cy={y(activePoint.values[si])}
                  r={4}
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}

          {/* Hit area: the whole plot, so the pointer only has to find the day. */}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(null)}
          />
        </svg>

        {activePoint && (
          <div
            className="pointer-events-none absolute top-0 z-10 min-w-36 rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm"
            style={
              flip
                ? { right: width - tooltipLeft + 12 }
                : { left: tooltipLeft + 12 }
            }
          >
            <p className="mb-1.5 text-muted-foreground">{dateLabel(activePoint.date, true)}</p>
            <ul className="space-y-1">
              {series.map((s, si) => (
                <li key={s.label} className="flex items-center gap-2">
                  <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
                  <span className="font-semibold text-foreground tabular-nums">
                    {fmt(activePoint.values[si])}
                  </span>
                  <span className="text-muted-foreground">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
