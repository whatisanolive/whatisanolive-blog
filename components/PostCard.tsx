import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import type { PublicPostCard } from "@/lib/posts";
import { hueVar, sectionForCategory, tagHref } from "@/lib/sections";
import { cn, formatDate, getPreview, readingTime } from "@/lib/utils";

type PostCardProps = {
  post: PublicPostCard;
  /**
   * Show the section above the title, tinted with that section's hue. Useful
   * anywhere posts from several sections appear together, like the homepage.
   */
  showSection?: boolean;
};

export function PostCard({ post, showSection = false }: PostCardProps) {
  const section = sectionForCategory(post.category);

  return (
    // The title link stretches over the whole card (its ::after covers it), so
    // the card is clickable while the tag links on top stay separate links.
    <article
      className={cn(
        "group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-edge bg-surface transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-brand/50",
      )}
      style={showSection ? ({ "--brand": hueVar(section.key) } as CSSProperties) : undefined}
    >
      {post.featuredImage && (
        <div className="relative aspect-[2/1] overflow-hidden border-b border-edge-soft">
          <Image
            src={post.featuredImage}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}

      <div className={cn("flex flex-1 flex-col gap-3 p-6", post.featuredImage && "pt-3")}>
        {showSection && <p className="kicker text-brand">{section.title}</p>}

        <h3 className="display text-balance-pretty text-xl text-ink transition-colors group-hover:text-brand-deep">
          <Link
            href={`/post/${post.slug}`}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-brand"
          >
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm leading-relaxed text-subtle">
          {getPreview(post.content, 32)}
        </p>

        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 pt-0.5">
            {post.tags.slice(0, 4).map(({ tag }) => (
              <li key={tag.id} className="relative z-10">
                <Link
                  href={tagHref(section.href, tag.name)}
                  className="block rounded-full border border-edge-soft px-2.5 py-0.5 font-mono text-[11px] text-faint transition-colors hover:border-brand/40 hover:text-brand-deep"
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center gap-3 border-t border-edge-soft pt-4 text-xs text-faint">
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          <span aria-hidden>&middot;</span>
          <span>{readingTime(post.content)} min</span>
          <ArrowRight
            className="ml-auto h-4 w-4 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand"
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}
