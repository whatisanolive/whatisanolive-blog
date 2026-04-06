"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deletePost(formData: FormData) {
  const id = formData.get("id") as string;

  await prisma.postTag.deleteMany({
    where: {postId: id},
  })

  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/admin");
}