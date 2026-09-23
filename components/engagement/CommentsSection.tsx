import Image from "next/image";

import { getComments, getViewer, type PublicComment } from "@/lib/engagement";
import { formatDate, pluralize } from "@/lib/utils";
import { CommentForm } from "./CommentForm";
import { DeleteCommentButton } from "./DeleteCommentButton";

/**
 * Comment list + form. Render inside <Suspense>: the list is cached per post,
 * but who's reading (and so which delete buttons show) is per request.
 */
export async function CommentsSection({ postId }: { postId: string }) {
  const [comments, viewer] = await Promise.all([getComments(postId), getViewer()]);

  return (
    <section id="comments" aria-labelledby="comments-heading" className="scroll-mt-24">
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-edge pb-4">
        <h2 id="comments-heading" className="display text-2xl text-ink">
          Comments
        </h2>
        <span className="kicker text-faint">{pluralize(comments.length, "comment")}</span>
      </div>

      <CommentForm postId={postId} signedIn={viewer.signedIn} />

      {comments.length === 0 ? (
        <p className="mt-8 text-sm text-faint">No comments yet. Start the conversation.</p>
      ) : (
        <ol className="mt-8 space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={viewer.isAdmin || (viewer.userId !== null && viewer.userId === comment.author.id)}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function CommentItem({ comment, canDelete }: { comment: PublicComment; canDelete: boolean }) {
  const { author } = comment;

  return (
    <li className="flex gap-3">
      {author.imageUrl ? (
        <Image
          src={author.imageUrl}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full border border-edge-soft object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-edge bg-ground-alt text-xs font-medium text-subtle"
        >
          {author.name.charAt(0).toUpperCase()}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink">{author.name}</p>
          <span aria-hidden className="text-faint">&middot;</span>
          <time dateTime={comment.createdAt} className="text-xs text-faint">
            {formatDate(comment.createdAt)}
          </time>
          {canDelete && (
            <div className="ml-auto">
              <DeleteCommentButton commentId={comment.id} />
            </div>
          )}
        </div>
        {/* Plain text only: comments are written by anyone, so they must never
            be rendered as HTML. whitespace-pre-wrap keeps their line breaks. */}
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-body">
          {comment.content}
        </p>
      </div>
    </li>
  );
}
