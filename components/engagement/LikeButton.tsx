"use client";

import { SignInButton } from "@clerk/nextjs";
import { Heart } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";

import { toggleLike } from "@/actions/toggle-like";
import { cn, pluralize } from "@/lib/utils";

type LikeButtonProps = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  signedIn: boolean;
};

const buttonClass =
  "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm transition-colors disabled:opacity-60";

export function LikeButton({ postId, initialLiked, initialCount, signedIn }: LikeButtonProps) {
  const [state, setState] = useState({ liked: initialLiked, count: initialCount });
  const [optimistic, setOptimistic] = useOptimistic(state);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const label = pluralize(optimistic.count, "like");

  if (!signedIn) {
    // Signed-out readers get Clerk's sign-in modal instead of a dead button.
    return (
      <SignInButton mode="modal">
        <button
          type="button"
          className={cn(buttonClass, "border-edge text-subtle hover:border-brand/50 hover:text-brand")}
          aria-label={`${label}. Sign in to like this post`}
        >
          <Heart className="h-4 w-4" aria-hidden />
          {label}
        </button>
      </SignInButton>
    );
  }

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      // Update the button immediately; it snaps back if the save fails.
      setOptimistic({
        liked: !state.liked,
        count: state.count + (state.liked ? -1 : 1),
      });
      const result = await toggleLike(postId);
      if (result.ok) {
        setState({ liked: result.liked, count: result.count });
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        aria-pressed={optimistic.liked}
        aria-label={optimistic.liked ? `Unlike (${label})` : `Like (${label})`}
        className={cn(
          buttonClass,
          optimistic.liked
            ? "border-brand/40 bg-brand/12 text-brand-deep"
            : "border-edge text-subtle hover:border-brand/50 hover:text-brand",
        )}
      >
        <Heart className={cn("h-4 w-4", optimistic.liked && "fill-current")} aria-hidden />
        {label}
      </button>
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
