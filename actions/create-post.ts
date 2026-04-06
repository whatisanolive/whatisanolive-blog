"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


const createPostSchema = z.object({
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

type CreatePostFormState = {
  errors: {
    title?: string[];
    category?: string[];
    tags?: string[];
    content?: string[];
    featuredImage?: string[];
    formErrors?: string[];
  };
};

export const createPost = async (
  prevState: CreatePostFormState,
  formData: FormData
): Promise<CreatePostFormState> => {
  // ✅ Validate form
  const result = createPostSchema.safeParse({
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

  // ✅ Image upload


const imageUrl = formData.get("featuredImage") as string | null;
  

  // ✅ Generate slug
  const slug = slugify(result.data.title, {
    lower: true,
    strict: true,
  });

  try {
    // ✅ Create post
    const post = await prisma.post.create({
      data: {
        title: result.data.title,
        slug,
        content: result.data.content,
        category: result.data.category as any,
        featuredImage: imageUrl || null,
        authorId: dbUser.id,
      },
    });

    // Handle tags
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
          postId: post.id,
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