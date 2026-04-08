import { prisma } from "@/lib/prisma";
import { PostSection } from "@/components/post-section";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Prisma } from "@prisma/client";

export default async function DSAPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const resolvedParams = await searchParams;
  const activeTag = resolvedParams.tag;

  // 1. Fetch available tags for DSA category
  const availableTags = await prisma.tag.findMany({
    where: {
      posts: {
        some: {
          post: { category: "DSA", status: "PUBLISHED" },
        },
      },
    },
  });

  // 2. Build properly typed where clause
  const whereClause: Prisma.PostWhereInput = {
    category: "DSA",
    status: "PUBLISHED",
  };

  if (activeTag) {
    whereClause.tags = { some: { tag: { name: activeTag } } };
  }

  // 3. Fetch posts, filtered if a tag is selected
  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  const formattedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      {/* FILTER HEADER */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
          <span className="text-zinc-400 text-sm font-medium mr-2">Filter by Tag:</span>
          
          <Link href="/dsa">
            <Badge className={`px-3 py-1 cursor-pointer transition-colors ${!activeTag ? 'bg-chart-1 text-zinc-950 hover:bg-chart-1/90' : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
              All
            </Badge>
          </Link>

          {availableTags.map((tag) => (
            <Link key={tag.id} href={`/dsa?tag=${tag.name}`}>
              <Badge className={`px-3 py-1 cursor-pointer transition-colors ${activeTag === tag.name ? 'bg-chart-1 text-zinc-950 hover:bg-chart-1/90' : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <PostSection title="DSA" posts={formattedPosts} hideExploreLink={true} />
    </main>
  );
}