"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

import { deleteComment } from "@/actions/comments";

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    if (!window.confirm("Delete this comment? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deleteComment(commentId);
      if (result.error) window.alert(result.error);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-label="Delete comment"
      title="Delete comment"
      className="flex h-7 w-7 items-center justify-center rounded-full text-faint transition-colors hover:bg-ground-alt hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}
