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
// const createPostSchema = z.object({
//   title: z.string().min(3).max(100),
//   category: z.nativeEnum(Category),
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
// type CreatePostFormState = {
//   errors: {
//     title?: string[];
//     category?: string[];
//     tags?: string[];
//     content?: string[];
//     featuredImage?: string[];
//     formErrors?: string[];
//   };
// };

export const createPost = async (
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

  // ✅ Generate slug
  const slug = buildPostSlug(result.data.title);

  try {
    // Previous sequential tag writes kept for reference per request.
    // const post = await prisma.post.create({
    //   data: {
    //     title: result.data.title,
    //     slug,
    //     content: result.data.content,
    //     category: result.data.category,
    //     featuredImage: imageUrl || null,
    //     authorId: dbUser.id,
    //   },
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
    //       postId: post.id,
    //       tagId: tag.id,
    //     },
    //   });
    // }

    await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          title: result.data.title,
          slug,
          content: result.data.content,
          category: result.data.category,
          featuredImage: result.data.featuredImage || null,
          authorId: dbUser.id,
        },
      });

      await syncPostTags(tx, post.id, result.data.tags);
    });
  } catch (err: unknown) {
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
    `/post/${slug}`,
  ]);
  redirect("/admin");
};
