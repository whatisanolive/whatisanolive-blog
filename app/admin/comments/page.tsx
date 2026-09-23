import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { CommentFilters } from "@/components/admin-comments/CommentFilters";
import { CommentsTable } from "@/components/admin-comments/CommentsTable";
import {
  COMMENTS_PER_PAGE,
  getAdminComments,
  getCommentPostOptions,
  parsePage,
} from "@/lib/admin-comments";
import { getAdminUser } from "@/lib/require-admin";
import { cn, pluralize } from "@/lib/utils";

export const metadata = { title: "Comments" };

type CommentsPageProps = {
  searchParams: Promise<{ q?: string; post?: string; page?: string }>;
};

export default async function AdminCommentsPage({ searchParams }: CommentsPageProps) {
  if (!(await getAdminUser())) redirect("/");

  return (
    <main className="flex-1 p-4 md:p-8">
      <header className="mb-6">
        <p className="kicker text-faint">Admin</p>
        <h1 className="display mt-2 text-3xl text-ink">Comments</h1>
        <p className="mt-2 text-sm text-subtle">
          Every comment on the blog. Deleting one removes it from the post straight away.
        </p>
      </header>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border bg-card" />}>
        <CommentsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function CommentsContent({ searchParams }: CommentsPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const postId = params.post ?? "";

  const [{ items, total, page, pageCount }, posts] = await Promise.all([
    getAdminComments({ search, postId, page: parsePage(params.page) }),
    getCommentPostOptions(),
  ]);

  const firstOnPage = (page - 1) * COMMENTS_PER_PAGE + 1;
  const lastOnPage = Math.min(page * COMMENTS_PER_PAGE, total);

  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (postId) query.set("post", postId);
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `?${qs}` : "/admin/comments";
  };

  return (
    <CommentFilters search={search} postId={postId} posts={posts}>
      <p className="mb-3 text-xs text-muted-foreground">
        {total === 0
          ? "No comments"
          : `Showing ${firstOnPage}–${lastOnPage} of ${pluralize(total, "comment")}`}
        {(search || postId) && " in this filter"}
      </p>

      <CommentsTable comments={items} />

      {pageCount > 1 && (
        <nav className="mt-4 flex items-center justify-between" aria-label="Pagination">
          <PageLink href={pageHref(page - 1)} disabled={page <= 1}>
            ← Newer
          </PageLink>
          <span className="text-xs text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <PageLink href={pageHref(page + 1)} disabled={page >= pageCount}>
            Older →
          </PageLink>
        </nav>
      )}
    </CommentFilters>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const className = cn(
    "inline-flex h-8 items-center rounded-full border px-3 text-xs transition-colors",
    disabled ? "pointer-events-none opacity-40" : "hover:bg-muted",
  );

  return disabled ? (
    <span aria-disabled className={className}>
      {children}
    </span>
  ) : (
    <Link href={href} scroll={false} className={className}>
      {children}
    </Link>
  );
}
