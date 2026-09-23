import "server-only";

import type { Category, Prisma } from "@prisma/client";
import { connection } from "next/server";

import { prisma } from "@/lib/prisma";
import { SECTIONS, SECTION_ORDER } from "@/lib/sections";

/** The posts management page. Uncached: admin only, and must be current. */

const adminPostSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  category: true,
  views: true,
  createdAt: true,
  publishedAt: true,
  _count: { select: { comments: true, likes: true } },
} satisfies Prisma.PostSelect;

type AdminPostRecord = Prisma.PostGetPayload<{ select: typeof adminPostSelect }>;

export type AdminPost = Omit<AdminPostRecord, "createdAt" | "publishedAt"> & {
  createdAt: string;
  publishedAt: string | null;
};

export type CategoryGroup = {
  category: Category;
  total: number;
  published: number;
  drafts: number;
  posts: AdminPost[];
};

export type AdminPostsOverview = {
  recent: AdminPost[];
  drafts: AdminPost[];
  groups: CategoryGroup[];
  tags: { id: string; name: string; count: number }[];
  totals: { all: number; published: number; drafts: number };
};

/** How many posts each category section lists before "View all". */
export const CATEGORY_PREVIEW_COUNT = 6;

function serialize(post: AdminPostRecord): AdminPost {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
  };
}

export async function getAdminPostsOverview(): Promise<AdminPostsOverview> {
  await connection();

  const [recent, drafts, grouped, tags, all, published] = await Promise.all([
    prisma.post.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: adminPostSelect }),
    prisma.post.findMany({
      where: { status: "DRAFT" },
      orderBy: { createdAt: "desc" },
      select: adminPostSelect,
    }),
    Promise.all(
      SECTION_ORDER.map(async (key) => {
        const category = SECTIONS[key].category;
        const [posts, total, publishedCount] = await Promise.all([
          prisma.post.findMany({
            where: { category },
            orderBy: { createdAt: "desc" },
            take: CATEGORY_PREVIEW_COUNT,
            select: adminPostSelect,
          }),
          prisma.post.count({ where: { category } }),
          prisma.post.count({ where: { category, status: "PUBLISHED" } }),
        ]);
        return {
          category,
          total,
          published: publishedCount,
          drafts: total - publishedCount,
          posts: posts.map(serialize),
        } satisfies CategoryGroup;
      }),
    ),
    prisma.tag.findMany({
      select: { id: true, name: true, _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
  ]);

  return {
    recent: recent.map(serialize),
    drafts: drafts.map(serialize),
    groups: grouped,
    tags: tags
      .map((tag) => ({ id: tag.id, name: tag.name, count: tag._count.posts }))
      .filter((tag) => tag.count > 0)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    totals: { all, published, drafts: all - published },
  };
}

/** Every post in one category, for the "View all" view. */
export async function getAdminPostsByCategory(category: Category): Promise<AdminPost[]> {
  await connection();

  const posts = await prisma.post.findMany({
    where: { category },
    orderBy: { createdAt: "desc" },
    select: adminPostSelect,
  });

  return posts.map(serialize);
}

export function parseCategory(value: unknown): Category | null {
  const match = SECTION_ORDER.map((key) => SECTIONS[key].category).find((c) => c === value);
  return match ?? null;
}
