import { Badge } from "@/components/ui/badge";
import { PostSection } from "@/components/post-section";
import { getPostsByCategory, getTagsForCategory } from "@/lib/posts";
import Link from "next/link";

type BlankCanvasPageSearchParams = Promise<{
  tag?: string | string[];
}>;

export default async function BlankCanvasPage({
  searchParams,
}: {
  searchParams: BlankCanvasPageSearchParams;
}) {
  const resolvedParams = await searchParams;
  const activeTag =
    typeof resolvedParams.tag === "string" ? resolvedParams.tag : undefined;

  const [availableTags, posts] = await Promise.all([
    getTagsForCategory("BLANK_CANVAS"),
    getPostsByCategory("BLANK_CANVAS", activeTag),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      {availableTags.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800/50 bg-zinc-950/50 p-4 backdrop-blur-sm">
          <span className="mr-2 text-sm font-medium text-zinc-400">
            Filter by Tag:
          </span>

          <Link href="/blank-canvas">
            <Badge
              className={`cursor-pointer px-3 py-1 transition-colors ${
                !activeTag
                  ? "bg-chart-1 text-zinc-950 hover:bg-chart-1/90"
                  : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              All
            </Badge>
          </Link>

          {availableTags.map((tag) => (
            <Link key={tag.id} href={`/blank-canvas?tag=${tag.name}`}>
              <Badge
                className={`cursor-pointer px-3 py-1 transition-colors ${
                  activeTag === tag.name
                    ? "bg-chart-1 text-zinc-950 hover:bg-chart-1/90"
                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <PostSection
        hideExploreLink={true}
        posts={posts}
        title="Blank Canvas"
      />
    </main>
  );
}
