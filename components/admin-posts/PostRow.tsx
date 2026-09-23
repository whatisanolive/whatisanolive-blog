import { ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";

import { publishPost } from "@/actions/publish-post";
import { DeletePostButton } from "@/components/admin-posts/DeletePostButton";
import type { AdminPost } from "@/lib/admin-posts";
import { sectionForCategory } from "@/lib/sections";
import { cn, formatDate } from "@/lib/utils";

/** One post in a management list: status, meta, and the actions for it. */
export function PostRow({ post, showCategory = true }: { post: AdminPost; showCategory?: boolean }) {
  const isDraft = post.status === "DRAFT";
  const section = sectionForCategory(post.category);

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="truncate font-medium text-foreground hover:underline"
          >
            {post.title}
          </Link>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
              isDraft
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
            )}
          >
            {isDraft ? "Draft" : "Published"}
          </span>
        </div>

        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          {showCategory && (
            <>
              <span>{section.title}</span>
              <span aria-hidden>·</span>
            </>
          )}
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{post.views.toLocaleString("en-US")} views</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{post._count.comments} comments</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{post._count.likes} likes</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        {isDraft && (
          <form action={publishPost}>
            <input type="hidden" name="id" value={post.id} />
            <button
              type="submit"
              className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Publish
            </button>
          </form>
        )}

        <Link
          href={`/admin/posts/${post.id}/edit`}
          aria-label={`Edit ${post.title}`}
          title="Edit post"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Link>

        {!isDraft && (
          <Link
            href={`/post/${post.slug}`}
            aria-label={`View ${post.title} on the site`}
            title="View on site"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        )}

        <DeletePostButton id={post.id} title={post.title} />
      </div>
    </li>
  );
}
