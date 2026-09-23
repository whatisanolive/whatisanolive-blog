"use server";

import { prisma } from "@/lib/prisma";
import { revalidateBlogData } from "@/lib/post-actions";
import { getAdminUser } from "@/lib/require-admin";

export async function deletePost(formData: FormData) {
  if (!(await getAdminUser())) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;

  // Previous delete flow kept for reference per request.
  // await prisma.postTag.deleteMany({
  //   where: {postId: id},
  // })
  //
  // await prisma.post.delete({
  //   where: { id },
  // });
  //
  // revalidatePath("/admin");

  const deletedPost = await prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id },
      select: {
        slug: true,
      },
    });

    await tx.postTag.deleteMany({
      where: { postId: id },
    });

    await tx.post.delete({
      where: { id },
    });

    return post;
  });

  revalidateBlogData([
    "/",
    "/admin",
    "/tech",
    "/dsa",
    "/blank-canvas",
    deletedPost ? `/post/${deletedPost.slug}` : `/post/${id}`,
  ]);
}
