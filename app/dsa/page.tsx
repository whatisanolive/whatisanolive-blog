import { PostSection } from "@/components/post-section";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getPostsByCategory, getTagsForCategory } from "@/lib/posts";

type DSAPageSearchParams = Promise<{
  tag?: string | string[];
}>;

export default async function DSAPage({
  searchParams,
}: {
  searchParams: DSAPageSearchParams;
}) {
  const resolvedParams = await searchParams;
  const activeTag =
    typeof resolvedParams.tag === "string" ? resolvedParams.tag : undefined;

  // Previous page-local Prisma queries kept for reference per request.
  // const availableTags = await prisma.tag.findMany({
  //   where: {
  //     posts: {
  //       some: {
  //         post: {
  //           category: "DSA",
  //           status: "PUBLISHED",
  //         },
  //       },
  //     },
  //   },
  // });
  //
  // const whereClause: Prisma.PostWhereInput = {
  //   category: "DSA",
  //   status: "PUBLISHED",
  // };
  //
  // if (activeTag) {
  //   whereClause.tags = {
  //     some: {
  //       tag: {
  //         name: activeTag,
  //       },
  //     },
  //   };
  // }
  //
  // const posts = await prisma.post.findMany({
  //   where: whereClause,
  //   orderBy: { createdAt: "desc" },
  //   include: {
  //     tags: {
  //       include: {
  //         tag: true,
  //       },
  //     },
  //   },
  // });
  //
  // const formattedPosts = posts.map((post) => ({
  //   ...post,
  //   createdAt: post.createdAt?.toISOString?.() ?? new Date().toISOString(),
  //   content: post.content || "",
  //   tags: post.tags || [],
  // }));

  const [availableTags, posts] = await Promise.all([
    getTagsForCategory("DSA"),
    getPostsByCategory("DSA", activeTag),
  ]);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">

      {/* 🔥 FILTER BAR */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
          <span className="text-zinc-400 text-sm font-medium mr-2">
            Filter by Tag:
          </span>

          {/* ALL */}
          <Link href="/dsa">
            <Badge
              className={`px-3 py-1 cursor-pointer transition-all duration-200 ${!activeTag
                ? "bg-chart-1 text-zinc-950 shadow"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
            >
              All
            </Badge>
          </Link>

          {/* TAGS */}
          {availableTags.map((tag) => (
            <Link key={tag.id} href={`/dsa?tag=${tag.name}`}>
              <Badge
                className={`px-3 py-1 cursor-pointer transition-all duration-200 ${activeTag === tag.name
                  ? "bg-chart-1 text-zinc-950 shadow"
                  : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
              >
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* 🔥 POSTS */}
      <PostSection
        title="DSA"
        posts={posts}
        hideExploreLink={true}
      />
    </main>
  );
}
