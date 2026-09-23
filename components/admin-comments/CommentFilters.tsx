"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";

import type { CommentPostOption } from "@/lib/admin-comments";
import { cn } from "@/lib/utils";

/**
 * Search + post filter for the moderation list. Both write to the URL, so a
 * filtered view can be bookmarked or shared. Search is debounced; while the
 * new list loads the old one stays on screen dimmed.
 */
export function CommentFilters({
  search,
  postId,
  posts,
  children,
}: {
  search: string;
  postId: string;
  posts: CommentPostOption[];
  children: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(search);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (debounce.current) clearTimeout(debounce.current);
  }, []);

  const push = (changes: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, next] of Object.entries(changes)) {
      if (next) params.set(key, next);
      else params.delete(key);
    }
    // Any filter change starts the list again from page one.
    params.delete("page");
    startTransition(() => router.replace(`?${params}`, { scroll: false }));
  };

  const onSearchChange = (next: string) => {
    setValue(next);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => push({ q: next.trim() }), 350);
  };

  const hasFilters = Boolean(value || postId);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={value}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search comments, people or posts"
            aria-label="Search comments"
            className="h-9 w-72 rounded-full border bg-card pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>

        <select
          value={postId}
          onChange={(e) => push({ post: e.target.value })}
          aria-label="Filter by post"
          className="h-9 max-w-64 rounded-full border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <option value="">All posts</option>
          {posts.map((post) => (
            <option key={post.id} value={post.id}>
              {post.title} ({post.count})
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              push({ q: "", post: "" });
            }}
            className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear
          </button>
        )}
      </div>

      <div className={cn("transition-opacity", isPending && "opacity-60")}>{children}</div>
    </>
  );
}
