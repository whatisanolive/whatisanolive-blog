import {prisma} from "@/lib/prisma"
import {PostSection} from "@/components/post-section"


export default async function Home() {

  const [techPosts, dsaPosts, thoughtsPosts] = await Promise.all([
    prisma.post.findMany({
      where: {category: "TECH", status: "PUBLISHED"},
      orderBy: {createdAt: "desc"},
      take: 3,
    }),
    prisma.post.findMany({
      where: {category: "DSA", status: "PUBLISHED"},
      orderBy: {createdAt: "desc"},
      take: 3,
    }),
    prisma.post.findMany({
      where: {category: "BLANK_CANVAS", status: "PUBLISHED"},
      orderBy: {createdAt: "desc"},
      take: 3,
    }),
  ])

  const formatPosts = (posts: any[]) =>
    posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
    }))

  return (
    
        <div className="min-h-screen">
      {/* Background Grid Overlay (Optional) */}
      <div className="fixed inset-0 bg-grid-white/[0.02] -z-10" />
      
      <main className="max-w-6xl mx-auto p-6 pb-24 space-y-24">
        {/* Your Hero Section here */}
        

        <PostSection title="Tech" posts={formatPosts(techPosts)} />
        <PostSection title="DSA" posts={formatPosts(dsaPosts)} />
        <PostSection title="Thoughts" posts={formatPosts(thoughtsPosts)} />
      </main>
    </div>

  )
}