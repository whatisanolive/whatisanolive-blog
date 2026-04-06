import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function getOrCreateUser() {
  const user = await currentUser();
  if (!user) return null;

  let dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkUserId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || "",
        imageUrl: user.imageUrl,
      },
    });
  }

  return dbUser;
}