import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { DeleteCommentButton } from '@/components/engagement/DeleteCommentButton'
import type { AdminRecentComment } from '@/lib/posts'
import { formatDate } from '@/lib/utils'

/** Latest comments across all posts, with delete for moderation. */
const RecentComments = ({ comments }: { comments: AdminRecentComment[] }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Comments</CardTitle>
          <Link
            href="/admin/comments"
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Moderate all
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {comment.author.name || comment.author.email}
                    </span>
                    {' on '}
                    <Link href={`/post/${comment.post.slug}#comments`} className="underline-offset-2 hover:underline">
                      {comment.post.title}
                    </Link>
                    {' · '}
                    {formatDate(comment.createdAt)}
                  </p>
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-sm">
                    {comment.content}
                  </p>
                </div>
                <DeleteCommentButton commentId={comment.id} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentComments
