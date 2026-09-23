import "server-only";

import type { Role } from "@prisma/client";
import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: Role;
  createdAt: string;
  posts: number;
  comments: number;
};

/** Everyone who has signed in, admins first. */
export async function getAdminUsers(): Promise<AdminUser[]> {
  await connection();

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      role: true,
      createdAt: true,
      _count: { select: { posts: true, comments: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name.trim() || "Reader",
    email: user.email,
    imageUrl: user.imageUrl,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    posts: user._count.posts,
    comments: user._count.comments,
  }));
}
