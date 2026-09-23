import "server-only";

import type { Category } from "@prisma/client";
import { connection } from "next/server";

import { dayKeyToDate, toDayKey } from "@/lib/activity";
import { RANGE_OPTIONS, parseRange, type RangeDays } from "@/lib/analytics-range";
import { prisma } from "@/lib/prisma";

/*
  Admin analytics. Uncached on purpose: it's only viewed by you, and should
  always be current.

  Days are `YYYY-MM-DD` keys in site.timeZone (see lib/activity.ts), so a
  view at 12:30am IST lands on the right day.

  - Views per day come from PostViewDaily (history starts when that table
    was added; Post.views holds the all-time total).
  - Likes and comments per day come from their own createdAt timestamps, so
    their history goes back to the first one.
*/

export { RANGE_OPTIONS, parseRange };
export type { RangeDays };

export type DayPoint = {
  date: string;
  views: number;
  likes: number;
  comments: number;
};

export type Kpi = { current: number; previous: number };

export type TopPost = {
  id: string;
  title: string;
  slug: string;
  category: Category;
  views: number;
  likes: number;
  comments: number;
};

export type AnalyticsData = {
  range: RangeDays;
  days: DayPoint[];
  kpis: {
    views: Kpi;
    likes: Kpi;
    comments: Kpi;
    published: Kpi;
  };
  topPosts: TopPost[];
  viewsBySection: { category: Category; views: number }[];
  allTime: { views: number; likes: number; comments: number };
  /** First day with any daily view data, or null if none yet. */
  viewHistoryStart: string | null;
};

/** The last `n` day keys, oldest first, ending today. */
function dayKeysEndingToday(n: number): string[] {
  const [y, m, d] = toDayKey(new Date()).split("-").map(Number);
  const today = Date.UTC(y, m - 1, d, 12); // midday: no DST edges
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(new Date(today - i * 86_400_000).toISOString().slice(0, 10));
  }
  return keys;
}

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export async function getAnalytics(range: RangeDays): Promise<AnalyticsData> {
  await connection();

  // Current window plus the one before it, for the deltas.
  const keys = dayKeysEndingToday(range * 2);
  const previousKeys = new Set(keys.slice(0, range));
  const currentKeys = keys.slice(range);
  const currentKeySet = new Set(currentKeys);

  const windowStart = dayKeyToDate(keys[0]);
  // Timestamps are bucketed by site.timeZone below; start a day early so no
  // event near midnight falls outside the query, then drop what's out of range.
  const since = new Date(windowStart.getTime() - 86_400_000);

  const [dailyViews, likes, comments, published, totals, firstViewDay] = await Promise.all([
    prisma.postViewDaily.findMany({
      where: { day: { gte: windowStart } },
      select: { postId: true, day: true, count: true, post: { select: { category: true } } },
    }),
    prisma.like.findMany({
      where: { createdAt: { gte: since } },
      select: { postId: true, createdAt: true },
    }),
    prisma.comment.findMany({
      where: { createdAt: { gte: since } },
      select: { postId: true, createdAt: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: since } },
      select: { publishedAt: true },
    }),
    Promise.all([
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.like.count(),
      prisma.comment.count(),
    ]),
    prisma.postViewDaily.findFirst({ orderBy: { day: "asc" }, select: { day: true } }),
  ]);

  const byDay = new Map<string, DayPoint>(
    keys.map((date) => [date, { date, views: 0, likes: 0, comments: 0 }]),
  );
  const perPost = new Map<string, { views: number; likes: number; comments: number }>();
  const viewsByCategory = new Map<Category, number>([
    ["TECH", 0],
    ["DSA", 0],
    ["BLANK_CANVAS", 0],
  ]);

  const postStats = (postId: string) => {
    let stats = perPost.get(postId);
    if (!stats) {
      stats = { views: 0, likes: 0, comments: 0 };
      perPost.set(postId, stats);
    }
    return stats;
  };

  for (const row of dailyViews) {
    const key = dateKey(row.day);
    const point = byDay.get(key);
    if (!point) continue;
    point.views += row.count;
    if (currentKeySet.has(key)) {
      postStats(row.postId).views += row.count;
      viewsByCategory.set(row.post.category, (viewsByCategory.get(row.post.category) ?? 0) + row.count);
    }
  }

  for (const [events, field] of [
    [likes, "likes"],
    [comments, "comments"],
  ] as const) {
    for (const event of events) {
      const key = toDayKey(event.createdAt);
      const point = byDay.get(key);
      if (!point) continue;
      point[field] += 1;
      if (currentKeySet.has(key)) postStats(event.postId)[field] += 1;
    }
  }

  const sumOver = (field: "views" | "likes" | "comments", window: Set<string>) =>
    keys.reduce((sum, key) => sum + (window.has(key) ? byDay.get(key)![field] : 0), 0);

  let publishedCurrent = 0;
  let publishedPrevious = 0;
  for (const post of published) {
    if (!post.publishedAt) continue;
    const key = toDayKey(post.publishedAt);
    if (currentKeySet.has(key)) publishedCurrent++;
    else if (previousKeys.has(key)) publishedPrevious++;
  }

  // Top posts in the current window: views first, then engagement.
  const ranked = [...perPost.entries()]
    .sort(
      ([, a], [, b]) =>
        b.views - a.views || b.likes + b.comments - (a.likes + a.comments),
    )
    .slice(0, 8);

  const postMeta = ranked.length
    ? await prisma.post.findMany({
        where: { id: { in: ranked.map(([id]) => id) } },
        select: { id: true, title: true, slug: true, category: true },
      })
    : [];
  const metaById = new Map(postMeta.map((post) => [post.id, post]));

  const topPosts: TopPost[] = ranked.flatMap(([id, stats]) => {
    const meta = metaById.get(id);
    return meta ? [{ ...meta, ...stats }] : [];
  });

  const [viewsSum, likesTotal, commentsTotal] = totals;

  return {
    range,
    days: currentKeys.map((key) => byDay.get(key)!),
    kpis: {
      views: { current: sumOver("views", currentKeySet), previous: sumOver("views", previousKeys) },
      likes: { current: sumOver("likes", currentKeySet), previous: sumOver("likes", previousKeys) },
      comments: {
        current: sumOver("comments", currentKeySet),
        previous: sumOver("comments", previousKeys),
      },
      published: { current: publishedCurrent, previous: publishedPrevious },
    },
    topPosts,
    viewsBySection: [...viewsByCategory.entries()].map(([category, views]) => ({ category, views })),
    allTime: {
      views: viewsSum._sum.views ?? 0,
      likes: likesTotal,
      comments: commentsTotal,
    },
    viewHistoryStart: firstViewDay ? dateKey(firstViewDay.day) : null,
  };
}
