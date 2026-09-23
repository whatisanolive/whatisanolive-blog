import { getLikeState } from "@/lib/engagement";
import { LikeButton } from "./LikeButton";

/** Render inside <Suspense>: like state is per reader and uncached. */
export async function LikeSection({ postId }: { postId: string }) {
  const { count, liked, signedIn } = await getLikeState(postId);

  return (
    <LikeButton
      postId={postId}
      initialLiked={liked}
      initialCount={count}
      signedIn={signedIn}
    />
  );
}
