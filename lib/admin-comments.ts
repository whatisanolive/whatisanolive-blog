import "server-only";

import type { Prisma } from "@prisma/client";
import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

/*
  The comment moderation list. Uncached (admin only, must be current), and
  paginated so a busy blog doesn't load every comment at once.
*/

export const COMMENTS_PER_PAGE = 20;

export type AdminComment = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; email: string; imageUrl: string | null };
  post: { id: string; title: string; slug: string };
};

export type AdminCommentsResult = {
  items: AdminComment[];
  total: number;
  page: number;
  pageCount: number;
};

export type CommentPostOption = { id: string; title: string; count: number };

export function parsePage(value: unknown): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function buildWhere(search: string, postId: string): Prisma.CommentWhereInput {
  const where: Prisma.CommentWhereInput = {};

  if (postId) where.postId = postId;

  if (search) {
    where.OR = [
      { content: { contains: search, mode: "insensitive" } },
      { author: { name: { contains: search, mode: "insensitive" } } },
      { author: { email: { contains: search, mode: "insensitive" } } },
      { post: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function getAdminComments({
  search = "",
  postId = "",
  page = 1,
}: {
  search?: string;
  postId?: string;
  page?: number;
}): Promise<AdminCommentsResult> {
  await connection();

  const where = buildWhere(search.trim(), postId);
  const total = await prisma.comment.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / COMMENTS_PER_PAGE));
  // A filter change can leave you past the last page; clamp instead of 404ing.
  const safePage = Math.min(page, pageCount);

  const comments = await prisma.comment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * COMMENTS_PER_PAGE,
    take: COMMENTS_PER_PAGE,
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true, email: true, imageUrl: true } },
      post: { select: { id: true, title: true, slug: true } },
    },
  });

  return {
    items: comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      author: { ...comment.author, name: comment.author.name.trim() || "Reader" },
    })),
    total,
    page: safePage,
    pageCount,
  };
}

/** Posts that have at least one comment, for the filter dropdown. */
export async function getCommentPostOptions(): Promise<CommentPostOption[]> {
  await connection();

  const grouped = await prisma.comment.groupBy({
    by: ["postId"],
    _count: { _all: true },
    orderBy: { _count: { postId: "desc" } },
    take: 50,
  });

  if (grouped.length === 0) return [];

  const posts = await prisma.post.findMany({
    where: { id: { in: grouped.map((row) => row.postId) } },
    select: { id: true, title: true },
  });
  const titleById = new Map(posts.map((post) => [post.id, post.title]));

  return grouped.flatMap((row) => {
    const title = titleById.get(row.postId);
    return title ? [{ id: row.postId, title, count: row._count._all }] : [];
  });
}
