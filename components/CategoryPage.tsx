import Link from "next/link";

import { PostCard } from "@/components/PostCard";
import { SectionIcon } from "@/components/SectionIcon";
import { getPostsByCategory, getTagsForCategory } from "@/lib/posts";
import { tagHref, type Section } from "@/lib/sections";
import { getSectionCopy } from "@/lib/settings";
import { cn, pluralize } from "@/lib/utils";

export type CategorySearchParams = Promise<{
  tag?: string | string[];
}>;

/** Listing page for one section; `data-pillar` repaints the whole page in its hue. */
export async function CategoryPage({
  section,
  searchParams,
}: {
  section: Section;
  searchParams: CategorySearchParams;
}) {
  const resolvedParams = await searchParams;
  const activeTag =
    typeof resolvedParams.tag === "string" ? resolvedParams.tag : undefined;

  const [availableTags, posts, sectionCopy] = await Promise.all([
    getTagsForCategory(section.category),
    getPostsByCategory(section.category, activeTag),
    getSectionCopy(),
  ]);
  const copy = sectionCopy[section.category];

  return (
    <div data-pillar={section.key} className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] grid-backdrop" />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <header className="mb-14 max-w-3xl">
          <div className="mb-6 flex items-center gap-2.5">
            <SectionIcon name={section.iconName} className="h-4 w-4 text-brand" />
            <span className="kicker text-brand">{copy.tagline}</span>
          </div>

          <h1 className="display text-balance-pretty text-4xl text-ink sm:text-6xl">
            {section.title}
          </h1>

          <div className="mt-8 flex gap-6">
            <span aria-hidden className="mt-3 h-px w-12 shrink-0 bg-edge" />
            <p className="text-lg leading-relaxed text-subtle">{copy.description}</p>
          </div>

          <p className="kicker mt-8 text-faint">
            {pluralize(posts.length, "post")}
            {activeTag && ` tagged “${activeTag}”`}
          </p>
        </header>

        {availableTags.length > 0 && (
          <nav aria-label="Filter by tag" className="mb-10">
            <ul className="flex flex-wrap gap-2">
              <li>
                <TagChip href={section.href} active={!activeTag}>
                  All
                </TagChip>
              </li>
              {availableTags.map((tag) => (
                <li key={tag.id}>
                  <TagChip
                    href={tagHref(section.href, tag.name)}
                    active={activeTag === tag.name}
                  >
                    {tag.name}
                  </TagChip>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {posts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-edge px-6 py-20 text-center">
            <p className="text-sm text-subtle">Nothing here yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TagChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block rounded-full border px-3 py-1 font-mono text-xs transition-colors",
        active
          ? "border-brand/40 bg-brand/12 text-brand-deep"
          : "border-edge text-subtle hover:border-brand/40 hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
