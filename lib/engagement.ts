import "server-only";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

/*
  Views, likes and comments.

  The post page itself is cached, so anything that changes per request or per
  reader is fetched here and rendered inside <Suspense> on the page:

  - view count and like state: uncached (`connection()`), always current
  - comments: cached per post, and expired with `updateTag` whenever a
    comment is added or deleted, so the commenter sees it straight away
*/

export function commentsTag(postId: string) {
  return `post-comments:${postId}`;
}

export async function getViewCount(postId: string): Promise<number> {
  await connection();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { views: true },
  });

  return post?.views ?? 0;
}

export type LikeState = {
  count: number;
  liked: boolean;
  signedIn: boolean;
};

export async function getLikeState(postId: string): Promise<LikeState> {
  await connection();
  const { userId } = await auth();

  const [count, own] = await Promise.all([
    prisma.like.count({ where: { postId } }),
    userId
      ? prisma.like.findFirst({
          where: { postId, user: { clerkUserId: userId } },
          select: { postId: true },
        })
      : null,
  ]);

  return { count, liked: Boolean(own), signedIn: Boolean(userId) };
}

export type PublicComment = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
};

export async function getComments(postId: string): Promise<PublicComment[]> {
  "use cache";

  cacheLife("days");
  cacheTag(commentsTag(postId));

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      // Never select the author's email: this data is shown publicly.
      author: { select: { id: true, name: true, imageUrl: true } },
    },
  });

  return comments.map((comment) => ({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    author: { ...comment.author, name: comment.author.name.trim() || "Reader" },
  }));
}

export type Viewer = {
  signedIn: boolean;
  /** Our User row id. Null until the reader first likes or comments, which
      is when getOrCreateUser() creates the row. */
  userId: string | null;
  isAdmin: boolean;
};

/** The current reader. Uncached: it differs per request. */
export async function getViewer(): Promise<Viewer> {
  await connection();
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { signedIn: false, userId: null, isAdmin: false };

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });

  return {
    signedIn: true,
    userId: user?.id ?? null,
    isAdmin: user?.role === "ADMIN",
  };
}
