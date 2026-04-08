import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Clock, Calendar } from "lucide-react"
import Image from "next/image"
import { Category } from "@prisma/client"
import { getPreview } from "@/lib/utils"

interface Post {
  id: string
  title: string
  description?: string | null
  createdAt: string
  category: Category
  slug: string
  featuredImage?: string | null
  content?: string
  tags?: {
    tag: {
      id: string
      name: string
    }
  }[]
}

interface PostSectionProps {
  title: string
  posts: Post[]
  hideExploreLink?: boolean
}

export function PostSection({ title, posts, hideExploreLink }: PostSectionProps) {
  // ✅ safer category fallback
  const category = posts?.[0]?.category ?? "TECH"

  const neonColor: Record<Category, string> = {
    TECH: "#3b82f6",
    DSA: "#10b981",
    BLANK_CANVAS: "#a855f7",
  };
  const color = neonColor[category] || "#3b82f6";

  return (
    <section className="group/section relative w-full lg:w-[90vw] lg:max-w-6xl mx-auto py-10 my-12">

      {/* Glass background */}
      <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] 
    bg-background/50 backdrop-blur-m -z-10 
    border border-chart-1/40 border-1
    transition-all duration-300
    group-hover:border-blue-500
    group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]
  "/>

      <div className="relative z-10 px-6 py-8 md:px-10 space-y-8 ">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold tracking-tighter text-chart-2/90">
            {title}
          </h2>

          {!hideExploreLink && (
            <Link
              href={`/${title.toLowerCase()}`}
              className="text-sm font-medium text-chart-1 hover:text-chart-2 flex items-center gap-1 transition-colors group/link"
            >
              Explore all
              <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          )}
        </div>

        {/* EMPTY STATE ✅ */}
        {posts.length === 0 ? (
          <p className="text-zinc-500 text-sm">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => {
              // ✅ safer read time
              const text =
                post.content?.replace(/<[^>]*>/g, "").trim() || ""
              const words = text ? text.split(/\s+/).length : 0
              const readTime = Math.max(1, Math.ceil(words / 200))

              return (
                <Link
                  href={`/post/${post.slug}`}
                  key={post.id}
                  className="group/card"
                >

                  <Card className="h-full bg-zinc-950/50 border-chart-2/50 !rounded-[24px] border-3 backdrop-blur-md transition-all duration-300 group-hover/card:border-zinc-700 group-hover/card:-translate-y-1 overflow-hidden border">

                    {post.featuredImage && (

                      <div className="overflow-hidden h-40 !rounded-t-[24px]">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          width={400}
                          height={160}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                        />
                      </div>
                    )}

                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">

                          <Badge className="text-[10px] uppercase font-bold bg-chart-2/50 text-zinc-300 border-none p-1">
                            {post.category}

                          </Badge>
                          {post.tags?.map((t) => (
                            <span key={t.tag.id} className="text-[10px] uppercase font-bold bg-zinc-800/70 text-zinc-300 border-none p-1 border">
                              {t.tag.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center text-zinc-500 text-[10px] gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </div>
                      </div>

                      <CardTitle className="leading-tight text-lg group-hover/card:text-white transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 pt-0">
                      <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2">
                        {getPreview(post.content)}
                      </p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex items-center text-[10px] text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {readTime} min read
                      </div>
                    </CardFooter>

                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}