import "server-only";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Server actions are public endpoints, so every post mutation must check this
// itself rather than relying on the admin pages being hidden.
export async function getAdminUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, role: true },
  });

  return user?.role === "ADMIN" ? user : null;
}
