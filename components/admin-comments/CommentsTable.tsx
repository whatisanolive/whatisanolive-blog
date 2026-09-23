"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteComment, deleteComments } from "@/actions/comments";
import type { AdminComment } from "@/lib/admin-comments";
import { cn, formatDate } from "@/lib/utils";

/** The moderation list: select several and delete, or delete one at a time. */
export function CommentsTable({ comments }: { comments: AdminComment[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allSelected = comments.length > 0 && selected.size === comments.length;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleExpanded = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const removeSelected = () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Delete ${ids.length === 1 ? "this comment" : `these ${ids.length} comments`}? This can't be undone.`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteComments(ids);
      if (result.error) setError(result.error);
      else {
        setSelected(new Set());
        router.refresh();
      }
    });
  };

  const removeOne = (id: string) => {
    if (!window.confirm("Delete this comment? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteComment(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  if (comments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        No comments match this view.
      </p>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() =>
              setSelected(allSelected ? new Set() : new Set(comments.map((c) => c.id)))
            }
            className="h-4 w-4 accent-[var(--brand)]"
          />
          {selected.size > 0 ? `${selected.size} selected` : "Select all on this page"}
        </label>

        <div className="flex items-center gap-3">
          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={removeSelected}
            disabled={selected.size === 0 || isPending}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors",
              selected.size === 0 || isPending
                ? "text-muted-foreground opacity-60"
                : "border-destructive/40 text-destructive hover:bg-destructive/10",
            )}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            {isPending ? "Deleting…" : "Delete selected"}
          </button>
        </div>
      </div>

      <ul className="divide-y">
        {comments.map((comment) => {
          const isExpanded = expanded.has(comment.id);
          const isLong = comment.content.length > 240;

          return (
            <li
              key={comment.id}
              className={cn("flex gap-3 px-4 py-4", selected.has(comment.id) && "bg-muted/40")}
            >
              <input
                type="checkbox"
                checked={selected.has(comment.id)}
                onChange={() => toggle(comment.id)}
                aria-label={`Select comment by ${comment.author.name}`}
                className="mt-1 h-4 w-4 accent-[var(--brand)]"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{comment.author.name}</span>
                  <span className="truncate">{comment.author.email}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                  <span aria-hidden>·</span>
                  <Link
                    href={`/post/${comment.post.slug}#comments`}
                    className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                  >
                    {comment.post.title}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </Link>
                </div>

                <p
                  className={cn(
                    "mt-1.5 whitespace-pre-wrap break-words text-sm text-foreground",
                    !isExpanded && "line-clamp-3",
                  )}
                >
                  {comment.content}
                </p>

                {isLong && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(comment.id)}
                    className="mt-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeOne(comment.id)}
                disabled={isPending}
                aria-label={`Delete comment by ${comment.author.name}`}
                title="Delete comment"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
