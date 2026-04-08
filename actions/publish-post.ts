"use server";
import {prisma} from '@/lib/prisma'
import { revalidateBlogData } from '@/lib/post-actions';
export async function publishPost(formData: FormData) {
  const id = formData.get("id") as string;

  // Previous single-path revalidation kept for reference per request.
  // await prisma.post.update({
  //   where: { id },
  //   data: {
  //     status: "PUBLISHED",
  //     publishedAt: new Date(),
  //   },
  // });
  //
  // revalidatePath("/admin");

  const post = await prisma.post.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    select: {
      slug: true,
    },
  });

  revalidateBlogData([
    "/",
    "/admin",
    "/tech",
    "/dsa",
    "/blank-canvas",
    `/post/${post.slug}`,
  ]);
}
