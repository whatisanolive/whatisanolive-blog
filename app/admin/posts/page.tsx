import { CirclePlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { PostRow } from "@/components/admin-posts/PostRow";
import {
  CATEGORY_PREVIEW_COUNT,
  getAdminPostsByCategory,
  getAdminPostsOverview,
  parseCategory,
  type AdminPost,
} from "@/lib/admin-posts";
import { getAdminUser } from "@/lib/require-admin";
import { sectionForCategory } from "@/lib/sections";
import { pluralize } from "@/lib/utils";

export const metadata = { title: "Posts" };

type PostsPageProps = { searchParams: Promise<{ category?: string }> };

export default async function AdminPostsPage({ searchParams }: PostsPageProps) {
  if (!(await getAdminUser())) redirect("/");

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-faint">Admin</p>
          <h1 className="display mt-2 text-3xl text-ink">Posts</h1>
          <p className="mt-2 text-sm text-subtle">
            Everything you&apos;ve written, newest first and grouped by section.
          </p>
        </div>

        <Link
          href="/admin/posts/create"
          className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <CirclePlus className="h-4 w-4" aria-hidden />
          New post
        </Link>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border bg-card" />}>
        <PostsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function PostsContent({ searchParams }: PostsPageProps) {
  const category = parseCategory((await searchParams).category);

  if (category) {
    const posts = await getAdminPostsByCategory(category);
    const section = sectionForCategory(category);

    return (
      <>
        <Link
          href="/admin/posts"
          className="mb-4 inline-block text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          ← All posts
        </Link>
        <Card title={section.title} meta={pluralize(posts.length, "post")}>
          <PostList posts={posts} showCategory={false} empty="Nothing in this section yet." />
        </Card>
      </>
    );
  }

  const { recent, drafts, groups, tags, totals } = await getAdminPostsOverview();

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        {pluralize(totals.all, "post")} · {totals.published} published · {totals.drafts} draft
        {totals.drafts === 1 ? "" : "s"}
      </p>

      <Card title="Latest posts" meta="5 most recent">
        <PostList posts={recent} empty="No posts yet. Write your first one." />
      </Card>

      {drafts.length > 0 && (
        <Card title="Drafts" meta={`${pluralize(drafts.length, "draft")} · not visible to readers`}>
          <PostList posts={drafts} empty="" />
        </Card>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {groups.map((group) => {
          const section = sectionForCategory(group.category);
          const hasMore = group.total > CATEGORY_PREVIEW_COUNT;

          return (
            <Card
              key={group.category}
              title={section.title}
              meta={`${pluralize(group.total, "post")}${group.drafts > 0 ? ` · ${group.drafts} draft${group.drafts === 1 ? "" : "s"}` : ""}`}
              action={
                hasMore ? (
                  <Link
                    href={`/admin/posts?category=${group.category}`}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    View all {group.total}
                  </Link>
                ) : null
              }
            >
              <PostList
                posts={group.posts}
                showCategory={false}
                empty={`Nothing in ${section.title} yet.`}
              />
            </Card>
          );
        })}
      </div>

      <Card title="Tags" meta={pluralize(tags.length, "tag")}>
        {tags.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No tags yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2 p-4">
            {tags.map((tag) => (
              <li key={tag.id}>
                <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground">
                  {tag.name}
                  <span className="tabular-nums text-foreground">{tag.count}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Card({
  title,
  meta,
  action,
  children,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <h2 className="text-sm font-medium text-foreground">
          {title}
          {meta && <span className="ml-2 text-xs font-normal text-muted-foreground">{meta}</span>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function PostList({
  posts,
  showCategory = true,
  empty,
}: {
  posts: AdminPost[];
  showCategory?: boolean;
  empty: string;
}) {
  if (posts.length === 0) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <ul className="divide-y">
      {posts.map((post) => (
        <PostRow key={post.id} post={post} showCategory={showCategory} />
      ))}
    </ul>
  );
}
