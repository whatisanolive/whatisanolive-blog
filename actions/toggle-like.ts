"use server";

import { Prisma } from "@prisma/client";

import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";

export type ToggleLikeResult =
  | { ok: true; liked: boolean; count: number }
  | { ok: false; error: string };

/** Likes or unlikes a published post for the signed-in reader. */
export async function toggleLike(postId: unknown): Promise<ToggleLikeResult> {
  if (typeof postId !== "string" || postId.length > 40) {
    return { ok: false, error: "Invalid post." };
  }

  const user = await getOrCreateUser();
  if (!user) {
    return { ok: false, error: "Sign in to like posts." };
  }

  const post = await prisma.post.findFirst({
    where: { id: postId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!post) {
    return { ok: false, error: "Post not found." };
  }

  const where = { userId_postId: { userId: user.id, postId } };
  const existing = await prisma.like.findUnique({ where });

  try {
    if (existing) {
      await prisma.like.delete({ where });
    } else {
      await prisma.like.create({ data: { userId: user.id, postId } });
    }
  } catch (err) {
    // A double click can race: the like was already created/removed by the
    // other request, which leaves the database in the state we wanted anyway.
    const raced =
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2002" || err.code === "P2025");
    if (!raced) throw err;
  }

  const count = await prisma.like.count({ where: { postId } });
  return { ok: true, liked: !existing, count };
}
