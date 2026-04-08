import { Category, type Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import slugify from "slugify";
import { z } from "zod";

import { BLOG_CACHE_TAGS } from "@/lib/posts";

const postFormSchema = z.object({
  title: z.string().trim().min(3).max(100),
  category: z.nativeEnum(Category),
  tags: z
    .string()
    .transform((value) =>
      Array.from(
        new Set(
          value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      ),
    )
    .refine((tags) => tags.length > 0, {
      message: "Please add at least one tag.",
    }),
  content: z.string().trim().min(50),
  featuredImage: z
    .union([z.string().trim().url(), z.literal("")])
    .optional()
    .transform((value) => value ?? ""),
});

export type PostActionState = {
  errors: {
    title?: string[];
    category?: string[];
    tags?: string[];
    content?: string[];
    featuredImage?: string[];
    formErrors?: string[];
  };
};

export type ParsedPostInput = z.infer<typeof postFormSchema>;

export function parsePostFormData(
  formData: FormData,
) {
  return postFormSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    tags: formData.get("tags"),
    content: formData.get("content"),
    featuredImage: formData.get("featuredImage"),
  });
}

export function buildPostSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
  });
}

export async function syncPostTags(
  tx: Prisma.TransactionClient,
  postId: string,
  tagNames: string[],
): Promise<void> {
  if (tagNames.length === 0) {
    return;
  }

  const existingTags = await tx.tag.findMany({
    where: {
      name: {
        in: tagNames,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const existingTagNames = new Set(existingTags.map((tag) => tag.name));
  const missingTagNames = tagNames.filter((tagName) => !existingTagNames.has(tagName));

  if (missingTagNames.length > 0) {
    await tx.tag.createMany({
      data: missingTagNames.map((tagName) => ({
        name: tagName,
        slug: buildPostSlug(tagName),
      })),
      skipDuplicates: true,
    });
  }

  const resolvedTags = await tx.tag.findMany({
    where: {
      name: {
        in: tagNames,
      },
    },
    select: {
      id: true,
    },
  });

  await tx.postTag.createMany({
    data: resolvedTags.map((tag) => ({
      postId,
      tagId: tag.id,
    })),
    skipDuplicates: true,
  });
}

export function revalidateBlogData(paths: string[]): void {
  revalidateTag(BLOG_CACHE_TAGS.posts, "max");
  revalidateTag(BLOG_CACHE_TAGS.tags, "max");

  for (const path of new Set(paths)) {
    revalidatePath(path);
  }
}
