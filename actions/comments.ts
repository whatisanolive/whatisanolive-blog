"use server";

import { auth } from "@clerk/nextjs/server";
import { updateTag } from "next/cache";
import { z } from "zod";

import { commentsTag } from "@/lib/engagement";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { getAdminUser } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const MAX_LENGTH = 2000;
/** Minimum gap between two comments from the same person. */
const RATE_LIMIT_MS = 20_000;

const commentSchema = z.object({
  postId: z.string().min(1).max(40),
  content: z
    .string()
    .trim()
    .min(1, "Write something first.")
    .max(MAX_LENGTH, `Keep it under ${MAX_LENGTH} characters.`),
});

export type CommentFormState = {
  error?: string;
  /** Changes on every successful submit, so the form knows to clear itself. */
  submittedAt?: number;
};

export async function addComment(
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment." };
  }
  const { postId, content } = parsed.data;

  const user = await getOrCreateUser();
  if (!user) {
    return { error: "Sign in to comment." };
  }

  const post = await prisma.post.findFirst({
    where: { id: postId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!post) {
    return { error: "This post isn't accepting comments." };
  }

  const recent = await prisma.comment.findFirst({
    where: {
      authorId: user.id,
      createdAt: { gt: new Date(Date.now() - RATE_LIMIT_MS) },
    },
    select: { id: true },
  });
  if (recent) {
    return { error: "You're commenting a little fast. Try again in a few seconds." };
  }

  await prisma.comment.create({
    data: { content, postId, authorId: user.id },
  });

  updateTag(commentsTag(postId));
  return { submittedAt: Date.now() };
}

/** Authors can delete their own comments; admins can delete any. */
export async function deleteComment(commentId: unknown): Promise<{ error?: string }> {
  if (typeof commentId !== "string" || commentId.length > 40) {
    return { error: "Invalid comment." };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { error: "Sign in first." };
  }

  const [viewer, comment] = await Promise.all([
    prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true, role: true },
    }),
    prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    }),
  ]);

  if (!comment) {
    return {};
  }
  if (!viewer || (viewer.role !== "ADMIN" && viewer.id !== comment.authorId)) {
    return { error: "You can't delete this comment." };
  }

  await prisma.comment.delete({ where: { id: commentId } });
  updateTag(commentsTag(comment.postId));
  return {};
}

/** Admin-only bulk delete, used by the moderation page. */
export async function deleteComments(
  commentIds: unknown,
): Promise<{ deleted: number; error?: string }> {
  if (!Array.isArray(commentIds) || commentIds.length === 0) {
    return { deleted: 0 };
  }
  const ids = commentIds.filter(
    (id): id is string => typeof id === "string" && id.length <= 40,
  );
  if (ids.length === 0 || ids.length > 100) {
    return { deleted: 0, error: "Invalid selection." };
  }

  if (!(await getAdminUser())) {
    return { deleted: 0, error: "You can't delete these comments." };
  }

  // Read the posts first: after the delete there's no way back to them, and
  // each one's cached comment list has to be expired.
  const comments = await prisma.comment.findMany({
    where: { id: { in: ids } },
    select: { id: true, postId: true },
  });
  if (comments.length === 0) return { deleted: 0 };

  const { count } = await prisma.comment.deleteMany({
    where: { id: { in: comments.map((comment) => comment.id) } },
  });

  for (const postId of new Set(comments.map((comment) => comment.postId))) {
    updateTag(commentsTag(postId));
  }

  return { deleted: count };
}
