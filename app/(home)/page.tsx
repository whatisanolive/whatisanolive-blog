import { PostSection } from "@/components/post-section"
import { getHomePagePostSections } from "@/lib/posts";

export default async function Home() {
  // Previous direct Prisma calls kept for reference per request.
  // const baseQuery = {
  //   orderBy: { createdAt: "desc" as const },
  //   take: 3,
  //   include: {
  //     tags: {
  //       include: {
  //         tag: true,
  //       },
  //     },
  //   },
  // }
  //
  // const [techPosts, dsaPosts, thoughtsPosts] = await Promise.all([
  //   prisma.post.findMany({ ...baseQuery, where: { category: "TECH", status: "PUBLISHED" } }),
  //   prisma.post.findMany({ ...baseQuery, where: { category: "DSA", status: "PUBLISHED" } }),
  //   prisma.post.findMany({ ...baseQuery, where: { category: "BLANK_CANVAS", status: "PUBLISHED" } }),
  // ])
  //
  // const formatPosts = <T extends { createdAt: Date }>(posts: T[]) =>
  //   posts.map((post) => ({
  //     ...post,
  //     createdAt: post.createdAt.toISOString(),
  //   }))

  const sections = await getHomePagePostSections();

  return (

    <div className="min-h-screen">
      {/* Background Grid Overlay (Optional) */}
      <div className="fixed inset-0 bg-grid-white/[0.02] -z-10" />

      <main className="max-w-6xl mx-auto p-6 pb-24 space-y-24">
        {/* Your Hero Section here */}


        <PostSection title="Tech" posts={sections.TECH} />
        <PostSection title="DSA" posts={sections.DSA} />
        <PostSection title="Blank Canvas" posts={sections.BLANK_CANVAS} />
      </main>
    </div>

  )
}
