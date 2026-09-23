"use client";

import { SignInButton } from "@clerk/nextjs";
import { useActionState, useState } from "react";

import { addComment, type CommentFormState } from "@/actions/comments";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 2000;

const pillButton =
  "inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors disabled:opacity-60";

export function CommentForm({ postId, signedIn }: { postId: string; signedIn: boolean }) {
  const [state, formAction, isPending] = useActionState<CommentFormState, FormData>(
    addComment,
    {},
  );
  const [content, setContent] = useState("");

  // Clear the box after a successful submit. Adjusting state during render
  // (rather than in an effect) is React's recommended way to react to a prop
  // or action result changing.
  const [handledSubmit, setHandledSubmit] = useState(state.submittedAt);
  if (state.submittedAt !== handledSubmit) {
    setHandledSubmit(state.submittedAt);
    setContent("");
  }

  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-edge px-5 py-4">
        <p className="text-sm text-subtle">Sign in to join the conversation.</p>
        <SignInButton mode="modal">
          <button
            type="button"
            className={cn(pillButton, "border border-edge text-subtle hover:border-brand hover:text-brand")}
          >
            Sign in to comment
          </button>
        </SignInButton>
      </div>
    );
  }

  const remaining = MAX_LENGTH - content.length;

  return (
    <form action={formAction} className="rounded-2xl border border-edge bg-surface p-4">
      <input type="hidden" name="postId" value={postId} />
      <label htmlFor="comment-content" className="sr-only">
        Your comment
      </label>
      <textarea
        id="comment-content"
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={3}
        required
        placeholder="Share a thought or ask a question…"
        className="w-full resize-y bg-transparent text-sm leading-relaxed text-ink outline-none placeholder:text-faint"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-edge-soft pt-3">
        <p className={cn("text-xs", remaining < 100 ? "text-destructive" : "text-faint")}>
          {state.error ? (
            <span className="text-destructive" role="alert">{state.error}</span>
          ) : (
            `${remaining} characters left`
          )}
        </p>
        <button
          type="submit"
          disabled={isPending || content.trim().length === 0}
          className={cn(pillButton, "bg-brand text-surface hover:bg-brand-deep")}
        >
          {isPending ? "Posting…" : "Post comment"}
        </button>
      </div>
    </form>
  );
}
