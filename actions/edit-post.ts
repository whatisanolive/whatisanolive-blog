"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import {
  buildPostSlug,
  parsePostFormData,
  revalidateBlogData,
  syncPostTags,
  type PostActionState,
} from "@/lib/post-actions";

// Previous schema and form state kept for reference per request.
// const editPostSchema = z.object({
//   title: z.string().min(3).max(100),
//   category: z.string().min(3).max(50),
//   tags: z
//     .string()
//     .min(1)
//     .transform((val) =>
//       val.split(",").map((tag) => tag.trim()).filter(Boolean)
//     ),
//   content: z.string().min(50),
//   featuredImage: z.string().optional(),
// });
//
// type EditPostFormState = {
//   errors: {
//     title?: string[];
//     category?: string[];
//     tags?: string[];
//     content?: string[];
//     featuredImage?: string[];
//     formErrors?: string[];
//   };
// };

export const editPost = async (
  postId: string,
  prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> => {
  // ✅ Validate form
  const result = parsePostFormData(formData);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  // ✅ Get user
  const user = await currentUser();

  if (!user) {
    return {
      errors: {
        formErrors: ["Unauthorized"],
      },
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!dbUser) {
    return {
      errors: {
        formErrors: ["User not found"],
      },
    };
  }

  const existingPost = await prisma.post.findFirst({
    where:
      dbUser.role === "ADMIN"
        ? { id: postId }
        : { id: postId, authorId: dbUser.id },
    select: {
      id: true,
      featuredImage: true,
      slug: true,
    },
  });

  if (!existingPost) {
      return {
          errors: {
              formErrors: ["Post not found or unauthorized"],
          }
      };
  }

  // ✅ Generate slug
  const slug = buildPostSlug(result.data.title);

  try {
    // Previous `category as any` cast and sequential tag writes kept for reference per request.
    // await prisma.post.update({
    //   where: { id: postId },
    //   data: {
    //     title: result.data.title,
    //     slug,
    //     content: result.data.content,
    //     category: result.data.category as any,
    //     featuredImage: imageUrl || existingPost?.featuredImage || null,
    //   },
    // });
    //
    // await prisma.postTag.deleteMany({
    //     where: { postId: postId }
    // });
    //
    // for (const tagName of result.data.tags) {
    //   const tag = await prisma.tag.upsert({
    //     where: { name: tagName },
    //     update: {},
    //     create: {
    //       name: tagName,
    //       slug: slugify(tagName, { lower: true }),
    //     },
    //   });
    //
    //   await prisma.postTag.create({
    //     data: {
    //       postId: postId,
    //       tagId: tag.id,
    //     },
    //   });
    // }

    await prisma.$transaction(async (tx) => {
      await tx.post.update({
        where: { id: postId },
        data: {
          title: result.data.title,
          slug,
          content: result.data.content,
          category: result.data.category,
          featuredImage:
            result.data.featuredImage || existingPost.featuredImage || null,
        },
      });

      await tx.postTag.deleteMany({
        where: { postId },
      });

      await syncPostTags(tx, postId, result.data.tags);
    });
  } catch (err) {
    console.error(err);

    return {
      errors: {
        formErrors: ["Something went wrong"],
      },
    };
  }

  revalidateBlogData([
    "/",
    "/admin",
    "/tech",
    "/dsa",
    "/blank-canvas",
    `/post/${existingPost.slug}`,
    `/post/${slug}`,
  ]);
  redirect("/admin");
};
