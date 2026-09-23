import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ChartCard } from "@/components/analytics/ChartCard";
import { RangeFilter } from "@/components/analytics/RangeFilter";
import { SectionBars } from "@/components/analytics/SectionBars";
import { StatTile } from "@/components/analytics/StatTile";
import { TimeSeriesChart } from "@/components/analytics/TimeSeriesChart";
import { getAnalytics, parseRange } from "@/lib/analytics";
import { getAdminUser } from "@/lib/require-admin";
import { sectionForCategory } from "@/lib/sections";
import { formatDate, pluralize } from "@/lib/utils";

export const metadata = { title: "Analytics" };

type AnalyticsPageProps = { searchParams: Promise<{ range?: string }> };

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  if (!(await getAdminUser())) redirect("/");

  return (
    <main className="flex-1 p-4 md:p-8">
      <header className="mb-6">
        <p className="kicker text-faint">Admin</p>
        <h1 className="display mt-2 text-3xl text-ink">Analytics</h1>
        <p className="mt-2 text-sm text-subtle">
          Views, likes and comments across the blog.
        </p>
      </header>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border bg-card" />}>
        <AnalyticsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function AnalyticsContent({ searchParams }: AnalyticsPageProps) {
  const range = parseRange((await searchParams).range);
  const data = await getAnalytics(range);
  const rangeLabel = `${range} days`;

  const windowStart = data.days[0]?.date;
  const viewsArePartial =
    !data.viewHistoryStart || (windowStart !== undefined && data.viewHistoryStart > windowStart);

  return (
    <RangeFilter range={range}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Views" kpi={data.kpis.views} rangeLabel={rangeLabel} />
          <StatTile label="Likes" kpi={data.kpis.likes} rangeLabel={rangeLabel} />
          <StatTile label="Comments" kpi={data.kpis.comments} rangeLabel={rangeLabel} />
          <StatTile label="Posts published" kpi={data.kpis.published} rangeLabel={rangeLabel} />
        </div>

        {viewsArePartial && (
          <p className="rounded-lg border border-dashed px-4 py-3 text-xs text-muted-foreground">
            {data.viewHistoryStart
              ? `Daily view tracking started on ${formatDate(data.viewHistoryStart)}, so earlier days show zero views. All-time totals are unaffected.`
              : "No views recorded yet. Daily tracking begins with the next visit to a published post."}
          </p>
        )}

        <ChartCard
          title="Views per day"
          subtitle={`Last ${range} days. One view per reader per post per day.`}
          tableHeadings={["Date", "Views"]}
          tableRows={data.days.map((day) => [formatDate(day.date), day.views])}
        >
          <TimeSeriesChart
            ariaLabel={`Views per day over the last ${range} days`}
            series={[{ label: "Views", color: "var(--series-1)" }]}
            data={data.days.map((day) => ({ date: day.date, values: [day.views] }))}
          />
        </ChartCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Likes and comments per day"
            subtitle="Both are counts of reader actions, so they share one scale."
            tableHeadings={["Date", "Likes", "Comments"]}
            tableRows={data.days.map((day) => [formatDate(day.date), day.likes, day.comments])}
          >
            <TimeSeriesChart
              ariaLabel={`Likes and comments per day over the last ${range} days`}
              series={[
                { label: "Likes", color: "var(--series-1)" },
                { label: "Comments", color: "var(--series-2)" },
              ]}
              data={data.days.map((day) => ({ date: day.date, values: [day.likes, day.comments] }))}
            />
          </ChartCard>

          <ChartCard
            title="Views by section"
            subtitle={`Last ${range} days.`}
            tableHeadings={["Section", "Views"]}
            tableRows={data.viewsBySection.map((row) => [
              sectionForCategory(row.category).title,
              row.views,
            ])}
          >
            <SectionBars data={data.viewsBySection} />
          </ChartCard>
        </div>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium text-foreground">
            Top posts <span className="text-muted-foreground">· last {range} days</span>
          </h2>

          {data.topPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing recorded in this range yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Post</th>
                    <th className="py-2 pr-4 font-medium">Section</th>
                    <th className="py-2 pr-4 font-medium">Views</th>
                    <th className="py-2 pr-4 font-medium">Likes</th>
                    <th className="py-2 font-medium">Comments</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {data.topPosts.map((post) => (
                    <tr key={post.id} className="border-t">
                      <td className="max-w-xs truncate py-2 pr-4">
                        <Link href={`/post/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        {sectionForCategory(post.category).title}
                      </td>
                      <td className="py-2 pr-4">{post.views.toLocaleString("en-US")}</td>
                      <td className="py-2 pr-4">{post.likes.toLocaleString("en-US")}</td>
                      <td className="py-2">{post.comments.toLocaleString("en-US")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs text-muted-foreground">
          All time: {pluralize(data.allTime.views, "view")} ·{" "}
          {pluralize(data.allTime.likes, "like")} ·{" "}
          {pluralize(data.allTime.comments, "comment")}
        </p>
      </div>
    </RangeFilter>
  );
}
