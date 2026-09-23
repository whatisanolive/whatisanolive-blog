import "server-only";

import type { Category, Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

import {
  buildActivityData,
  buildActivityStats,
  type ActivityDay,
  type ActivityStats,
} from "@/lib/activity";
import { prisma } from "@/lib/prisma";

export const BLOG_CACHE_TAGS = {
  posts: "blog-posts",
  tags: "blog-tags",
} as const;

const publicTagSelect = {
  id: true,
  name: true,
} satisfies Prisma.TagSelect;

const publicPostCardSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  category: true,
  featuredImage: true,
  createdAt: true,
  tags: {
    select: {
      tag: {
        select: publicTagSelect,
      },
    },
  },
} satisfies Prisma.PostSelect;

const publicPostDetailSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  contentFormat: true,
  category: true,
  featuredImage: true,
  createdAt: true,
  tags: {
    select: {
      tag: {
        select: publicTagSelect,
      },
    },
  },
} satisfies Prisma.PostSelect;

const adminRecentPostSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  category: true,
  views: true,
  createdAt: true,
} satisfies Prisma.PostSelect;

const adminRecentCommentSelect = {
  id: true,
  content: true,
  createdAt: true,
  author: { select: { name: true, email: true } },
  post: { select: { title: true, slug: true } },
} satisfies Prisma.CommentSelect;

const editablePostSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  contentFormat: true,
  category: true,
  featuredImage: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  tags: {
    select: {
      tag: {
        select: publicTagSelect,
      },
    },
  },
} satisfies Prisma.PostSelect;

type PublicPostCardRecord = Prisma.PostGetPayload<{
  select: typeof publicPostCardSelect;
}>;

export type PublicPostCard = Omit<PublicPostCardRecord, "createdAt"> & {
  createdAt: string;
};

export type PublicPostDetail = Prisma.PostGetPayload<{
  select: typeof publicPostDetailSelect;
}>;

export type BlogTag = Prisma.TagGetPayload<{
  select: typeof publicTagSelect;
}>;

export type AdminRecentPost = Prisma.PostGetPayload<{
  select: typeof adminRecentPostSelect;
}>;

export type AdminRecentComment = Omit<
  Prisma.CommentGetPayload<{ select: typeof adminRecentCommentSelect }>,
  "createdAt"
> & { createdAt: string };

export type EditablePost = Prisma.PostGetPayload<{
  select: typeof editablePostSelect;
}>;

type HomePageData = {
  counts: Record<Category, number>;
  recent: PublicPostCard[];
  activity: ActivityDay[];
  activityStats: ActivityStats;
};

function serializePostCard(post: PublicPostCardRecord): PublicPostCard {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
  };
}

function buildPublishedCategoryWhere(
  category: Category,
  activeTag?: string,
): Prisma.PostWhereInput {
  return {
    category,
    status: "PUBLISHED",
    ...(activeTag
      ? {
          tags: {
            some: {
              tag: {
                name: activeTag,
              },
            },
          },
        }
      : {}),
  };
}

export async function getHomePageData(): Promise<HomePageData> {
  "use cache";

  cacheLife("days");
  cacheTag(BLOG_CACHE_TAGS.posts, "home");

  const [grouped, recent, published] = await Promise.all([
    prisma.post.groupBy({
      by: ["category"],
      where: { status: "PUBLISHED" },
      _count: { _all: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: publicPostCardSelect,
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { publishedAt: true, createdAt: true },
    }),
  ]);

  const counts: Record<Category, number> = { TECH: 0, DSA: 0, BLANK_CANVAS: 0 };
  for (const row of grouped) {
    counts[row.category] = row._count._all;
  }

  // "Today" is fixed when this cache entry is created; with cacheLife("days")
  // the window moves forward at least daily, and immediately on publish.
  const activity = buildActivityData(
    published.map((post) => post.publishedAt ?? post.createdAt),
    new Date(),
  );

  return {
    counts,
    recent: recent.map(serializePostCard),
    activity,
    activityStats: buildActivityStats(activity, published.length),
  };
}

export async function getPostsByCategory(
  category: Category,
  activeTag?: string,
): Promise<PublicPostCard[]> {
  "use cache";

  cacheLife("days");
  cacheTag(
    BLOG_CACHE_TAGS.posts,
    `${BLOG_CACHE_TAGS.posts}:${category}`,
    activeTag
      ? `${BLOG_CACHE_TAGS.posts}:${category}:${activeTag}`
      : `${BLOG_CACHE_TAGS.posts}:${category}:all`,
  );

  const posts = await prisma.post.findMany({
    where: buildPublishedCategoryWhere(category, activeTag),
    orderBy: { createdAt: "desc" },
    select: publicPostCardSelect,
  });

  return posts.map(serializePostCard);
}

export async function getTagsForCategory(category: Category): Promise<BlogTag[]> {
  "use cache";

  cacheLife("days");
  cacheTag(BLOG_CACHE_TAGS.tags, `${BLOG_CACHE_TAGS.tags}:${category}`);

  return prisma.tag.findMany({
    where: {
      posts: {
        some: {
          post: buildPublishedCategoryWhere(category),
        },
      },
    },
    orderBy: {
      name: "asc",
    },
    select: publicTagSelect,
  });
}

export async function getPostBySlug(
  slug: string,
): Promise<PublicPostDetail | null> {
  "use cache";

  cacheLife("days");
  cacheTag(BLOG_CACHE_TAGS.posts, `${BLOG_CACHE_TAGS.posts}:${slug}`);

  return prisma.post.findUnique({
    where: { slug },
    select: publicPostDetailSelect,
  });
}

export async function getAdminDashboardData(): Promise<{
  stats: {
    postsCount: number;
    viewsCount: number;
    commentsCount: number;
    likesCount: number;
  };
  posts: AdminRecentPost[];
  comments: AdminRecentComment[];
}> {
  const [postsCount, views, commentsCount, likesCount, posts, comments] =
    await prisma.$transaction([
      prisma.post.count(),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.comment.count(),
      prisma.like.count(),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: adminRecentPostSelect,
      }),
      prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: adminRecentCommentSelect,
      }),
    ]);

  return {
    stats: {
      postsCount,
      viewsCount: views._sum.views ?? 0,
      commentsCount,
      likesCount,
    },
    posts,
    comments: comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  };
}

export async function getEditablePostById(
  id: string,
): Promise<EditablePost | null> {
  return prisma.post.findUnique({
    where: { id },
    select: editablePostSelect,
  });
}
