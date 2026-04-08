import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

const sessionUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

export type SessionUser = Prisma.UserGetPayload<{
  select: typeof sessionUserSelect;
}>;

export async function getOrCreateUser(): Promise<SessionUser | null> {
  const user = await currentUser();
  if (!user) return null;

  let dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
    select: sessionUserSelect,
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkUserId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || "",
        imageUrl: user.imageUrl,
      },
      select: sessionUserSelect,
    });
  }

  return dbUser;
}
