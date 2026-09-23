import { ArrowLeft, Home, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CommentsSection } from "@/components/engagement/CommentsSection";
import { LikeSection } from "@/components/engagement/LikeSection";
import { ViewCount } from "@/components/engagement/ViewCount";
import { ViewTracker } from "@/components/engagement/ViewTracker";
import MarkdownContent from "@/components/MarkdownContent";
import RenderContent from "@/components/RenderContent";
import { SectionIcon } from "@/components/SectionIcon";
import { renderMarkdown } from "@/lib/markdown";
import { getPostBySlug } from "@/lib/posts";
import { sectionForCategory, tagHref } from "@/lib/sections";
import { formatDate, getPreview, readingTime } from "@/lib/utils";

type PostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return {};

  return {
    title: post.title,
    description: getPreview(post.content, 30),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();

  const section = sectionForCategory(post.category);

  return (
    <div data-pillar={section.key} className="mx-auto max-w-3xl px-6 py-12">
      {/* BREADCRUMBS */}
      <nav aria-label="Breadcrumb" className="mb-10 min-w-0">
        <ol className="kicker flex flex-wrap items-center gap-x-2 gap-y-1 text-faint">
          <li>
            <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-brand">
              <Home className="h-3 w-3" />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="text-edge">/</span>
            <Link href={section.href} className="transition-colors hover:text-brand">
              {section.title}
            </Link>
          </li>
          <li className="flex min-w-0 items-center gap-2">
            <span aria-hidden className="text-edge">/</span>
            <span aria-current="page" className="truncate text-brand" title={post.title}>
              {post.title}
            </span>
          </li>
        </ol>
      </nav>

      <article>
        <header className="mb-12">
          <div className="mb-6 flex items-center gap-2.5">
            <SectionIcon name={section.iconName} className="h-4 w-4 text-brand" />
            <span className="kicker text-brand">{section.title}</span>
          </div>

          <h1 className="display text-balance-pretty text-4xl leading-[1.1] text-ink sm:text-5xl">
            {post.title}
          </h1>

          <div className="kicker mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-edge pt-5 text-faint">
            <time dateTime={new Date(post.createdAt).toISOString()}>{formatDate(post.createdAt)}</time>
            <span aria-hidden>&middot;</span>
            <span>{readingTime(post.content)} min read</span>
            <span aria-hidden>&middot;</span>
            <Suspense fallback={<span className="inline-block h-3 w-12 animate-pulse rounded bg-edge-soft" />}>
              <ViewCount postId={post.id} />
            </Suspense>
            {post.tags.length > 0 && (
              <ul className="flex flex-wrap gap-x-2 sm:ml-auto">
                {post.tags.map(({ tag }, i) => (
                  <li key={tag.id} className="flex gap-2">
                    {i > 0 && <span aria-hidden className="text-edge">/</span>}
                    <Link
                      href={tagHref(section.href, tag.name)}
                      className="text-brand transition-colors hover:text-brand-deep hover:underline"
                    >
                      {tag.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        {post.featuredImage && (
          <div className="relative mb-12 aspect-video overflow-hidden rounded-2xl border border-edge">
            <Image
              src={post.featuredImage}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              preload
              className="object-cover"
            />
          </div>
        )}

        {post.contentFormat === "MARKDOWN" ? (
          <MarkdownContent html={await renderMarkdown(post.content)} />
        ) : (
          <RenderContent content={post.content || ""} />
        )}
      </article>

      <ViewTracker postId={post.id} />

      {/* LIKES */}
      <div className="mt-16 flex flex-wrap items-center gap-3 border-t border-edge pt-6">
        <Suspense fallback={<div className="h-9 w-24 animate-pulse rounded-full bg-edge-soft" />}>
          <LikeSection postId={post.id} />
        </Suspense>
        <a
          href="#comments"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-edge px-4 text-sm text-subtle transition-colors hover:border-brand/50 hover:text-brand"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Comments
        </a>
      </div>

      {/* COMMENTS */}
      <div className="mt-16">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-edge-soft/60" />}>
          <CommentsSection postId={post.id} />
        </Suspense>
      </div>

      <nav className="mt-20 border-t border-edge pt-8" aria-label="More posts">
        <Link
          href={section.href}
          className="kicker inline-flex items-center gap-2 text-faint transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          All {section.title} posts
        </Link>
      </nav>
    </div>
  );
}
