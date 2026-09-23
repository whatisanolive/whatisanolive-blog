/* -------------------------------------------------------------------------- */
/*                              Consistency stats                             */
/* -------------------------------------------------------------------------- */
/*
  Pure functions over publish dates, so they can run inside a cached query.
  Days are `YYYY-MM-DD` strings in `site.timeZone`, not the server's timezone,
  so a post published just after midnight lands on the right day.
*/

import { site } from "@/lib/site";

export type ActivityDay = { date: string; count: number; level: number };

export type ActivityStats = {
  totalPosts: number;
  postsInWindow: number;
  activeDays: number;
  currentStreakWeeks: number;
  longestStreakWeeks: number;
};

// en-CA formats as YYYY-MM-DD.
const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: site.timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** `YYYY-MM-DD` for this instant, in site.timeZone. */
export function toDayKey(date: Date) {
  return dayFormatter.format(date);
}

/** A `YYYY-MM-DD` key as a UTC-midnight Date, the form Postgres DATE columns use. */
export function dayKeyToDate(key: string) {
  return new Date(`${key}T00:00:00.000Z`);
}

function levelFor(count: number) {
  return Math.min(Math.max(count, 0), 4);
}

/**
 * One entry per day for the trailing `days` window ending today, so the
 * calendar renders a full grid rather than only the days that have posts.
 */
export function buildActivityData(publishDates: Date[], now: Date, days = 365): ActivityDay[] {
  const counts = new Map<string, number>();
  for (const date of publishDates) {
    const key = toDayKey(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  // Step back from today's date in UTC at midday, which has no DST edges.
  const [y, m, d] = toDayKey(now).split("-").map(Number);
  const today = Date.UTC(y, m - 1, d, 12);

  const out: ActivityDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(today - i * 86_400_000).toISOString().slice(0, 10);
    const count = counts.get(key) ?? 0;
    out.push({ date: key, count, level: levelFor(count) });
  }

  return out;
}

/**
 * Weekly streaks: a blog cadence is measured in weeks, not days.
 *
 * Buckets run backwards from today so the most recent bucket is the last seven
 * days. Bucketing forwards would leave a one-day remainder at the end
 * (365 = 52*7 + 1), reporting a current streak of zero six days out of seven.
 */
export function buildActivityStats(data: ActivityDay[], totalPosts: number): ActivityStats {
  const weeks: number[] = [];
  for (let end = data.length; end > 0; end -= 7) {
    const start = Math.max(0, end - 7);
    weeks.unshift(data.slice(start, end).reduce((sum, day) => sum + day.count, 0));
  }

  let longest = 0;
  let running = 0;
  for (const total of weeks) {
    running = total > 0 ? running + 1 : 0;
    longest = Math.max(longest, running);
  }

  let current = 0;
  for (let i = weeks.length - 1; i >= 0 && weeks[i] > 0; i--) current++;

  return {
    totalPosts,
    postsInWindow: data.reduce((sum, day) => sum + day.count, 0),
    activeDays: data.filter((day) => day.count > 0).length,
    currentStreakWeeks: current,
    longestStreakWeeks: longest,
  };
}
