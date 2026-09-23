import { getViewCount } from "@/lib/engagement";
import { pluralize } from "@/lib/utils";

/** Always-current view count. Render inside <Suspense>: it reads uncached data. */
export async function ViewCount({ postId }: { postId: string }) {
  const views = await getViewCount(postId);
  return <span>{pluralize(views, "view")}</span>;
}
