import "server-only";

import type { Category, Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

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
  createdAt: true,
} satisfies Prisma.PostSelect;

const editablePostSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
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

export type EditablePost = Prisma.PostGetPayload<{
  select: typeof editablePostSelect;
}>;

type HomePagePostSections = Record<Category, PublicPostCard[]>;

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

export async function getHomePagePostSections(): Promise<HomePagePostSections> {
  "use cache";

  cacheLife("days");
  cacheTag(BLOG_CACHE_TAGS.posts, "home");

  const categories: Category[] = ["TECH", "DSA", "BLANK_CANVAS"];

  const results = await prisma.$transaction(
    categories.map((category) =>
      prisma.post.findMany({
        where: buildPublishedCategoryWhere(category),
        orderBy: { createdAt: "desc" },
        take: 3,
        select: publicPostCardSelect,
      }),
    ),
  );

  return {
    TECH: results[0].map(serializePostCard),
    DSA: results[1].map(serializePostCard),
    BLANK_CANVAS: results[2].map(serializePostCard),
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
    commentsCount: number;
    likesCount: number;
  };
  posts: AdminRecentPost[];
}> {
  const [postsCount, commentsCount, likesCount, posts] =
    await prisma.$transaction([
      prisma.post.count(),
      prisma.comment.count(),
      prisma.like.count(),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: adminRecentPostSelect,
      }),
    ]);

  return {
    stats: {
      postsCount,
      commentsCount,
      likesCount,
    },
    posts,
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
