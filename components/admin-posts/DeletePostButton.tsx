"use client";

import { Trash2 } from "lucide-react";

import { deletePost } from "@/actions/delete-post";

/** Delete with a confirmation — a post can't be recovered afterwards. */
export function DeletePostButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deletePost}
      onSubmit={(e) => {
        if (!window.confirm(`Delete “${title}”? This also deletes its comments and likes, and can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={`Delete ${title}`}
        title="Delete post"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
