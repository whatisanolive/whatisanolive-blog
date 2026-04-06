"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const editPostSchema = z.object({
  title: z.string().min(3).max(100),
  category: z.string().min(3).max(50),
  tags: z
    .string()
    .min(1)
    .transform((val) =>
      val.split(",").map((tag) => tag.trim()).filter(Boolean)
    ),
  content: z.string().min(50),
  featuredImage: z.string().optional(),
});

type EditPostFormState = {
  errors: {
    title?: string[];
    category?: string[];
    tags?: string[];
    content?: string[];
    featuredImage?: string[];
    formErrors?: string[];
  };
};

export const editPost = async (
  postId: string,
  prevState: EditPostFormState,
  formData: FormData
): Promise<EditPostFormState> => {
  // ✅ Validate form
  const result = editPostSchema.safeParse({
    title: formData.get("title") as string,
    category: formData.get("category") as string,
    tags: formData.get("tags") as string,
    content: formData.get("content") as string,
    featuredImage: formData.get("featuredImage") || "",
  });

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

  const existingPost = await prisma.post.findUnique({
    where: { id: postId, authorId: dbUser.id },
  });

  if (!existingPost && dbUser.role !== 'ADMIN') {
      return {
          errors: {
              formErrors: ["Post not found or unauthorized"],
          }
      };
  }

  const imageUrl = formData.get("featuredImage") as string | null;

  // ✅ Generate slug
  const slug = slugify(result.data.title, {
    lower: true,
    strict: true,
  });

  try {
    // ✅ Update post
    await prisma.post.update({
      where: { id: postId },
      data: {
        title: result.data.title,
        slug,
        content: result.data.content,
        category: result.data.category as any,
        featuredImage: imageUrl || existingPost?.featuredImage || null,
      },
    });

    // Handle tags (delete existing and recreate)
    await prisma.postTag.deleteMany({
        where: { postId: postId }
    });

    for (const tagName of result.data.tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: {
          name: tagName,
          slug: slugify(tagName, { lower: true }),
        },
      });

      await prisma.postTag.create({
        data: {
          postId: postId,
          tagId: tag.id,
        },
      });
    }
  } catch (err) {
    console.error(err);

    return {
      errors: {
        formErrors: ["Something went wrong"],
      },
    };
  }

  revalidatePath('/admin')
  redirect("/admin");
};
