"use server";
import {prisma} from '@/lib/prisma'
import { revalidatePath } from 'next/cache';
export async function publishPost(formData: FormData) {
  const id = formData.get("id") as string;

  await prisma.post.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  revalidatePath("/admin");
}