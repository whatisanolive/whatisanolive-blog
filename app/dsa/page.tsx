import { prisma } from "@/lib/prisma";
import { PostSection } from "@/components/post-section";

export default async function TechPage() {
  const posts = await prisma.post.findMany({
    where: { category: "DSA", status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  const formattedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  return (
    <main className="max-w-6xl mx-auto p-6">
      <PostSection title="DSA" posts={formattedPosts} hideExploreLink={true} />
    </main>
  );
}