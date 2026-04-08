import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import RenderContent from '@/components/RenderContent';

export default async function PostPage({ params }: any) {
  const resolvedParams = await params;

  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center text-zinc-500">
      Post not found
    </div>
  );

  // Read time calculation safely
  const text = post.content?.replace(/<[^>]*>/g, "").trim() || "";
  const words = text ? text.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="min-h-screen relative pb-32 overflow-hidden">
      {/* Dynamic Background Blur using Featured Image */}
      {post.featuredImage && (
        <div className="absolute top-0 inset-x-0 h-[60vh] -z-10 overflow-hidden opacity-20 pointer-events-none">
          <Image
            src={post.featuredImage}
            alt="background blur"
            fill
            className="object-cover blur-[120px] saturate-[2]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/80 to-zinc-950" />
        </div>
      )}

      {/* TOP PROGRESS BAR (Optional placeholder for client logic) */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-900/50">
        <div className="h-full bg-blue-500 w-0 transition-all duration-300" id="scroll-progress" />
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-12 md:pt-24 space-y-16">
        {/* BACK BUTTON */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm font-medium group"
        >
          <div className="p-2.5 rounded-full bg-zinc-900/80 border border-zinc-800 group-hover:border-chart-1 transition-colors backdrop-blur-xl">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </div>
          Back to feed
        </Link>

        {/* HERO HEADER */}
        <header className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge className="bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/50 px-4 py-1.5 uppercase tracking-widest text-xs backdrop-blur-md">
              {post.category}
            </Badge>
            {post.tags?.map((t) => (
              <Badge key={t.tag.id} className="bg-chart-1/20 text-chart-1 hover:bg-chart-1/30 border border-chart-1/30 px-3 py-1.5 uppercase tracking-widest text-[10px] backdrop-blur-md">
                {t.tag.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter text-white leading-[1.1] mx-auto max-w-3xl">
            {post.title}
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-4 text-zinc-400 text-sm py-4">
            <div className="flex items-center gap-2 bg-zinc-900/60 px-4 py-2 rounded-full border border-zinc-800/50 backdrop-blur-md">
              <Calendar className="w-4 h-4 text-blue-400" />
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/60 px-4 py-2 rounded-full border border-zinc-800/50 backdrop-blur-md">
              <Clock className="w-4 h-4 text-emerald-400" />
              {readTime} min read
            </div>
          </div>
        </header>

        {/* FEATURED IMAGE WITH GLOW & GLASS BORDER */}
        {post.featuredImage && (
          <div className="relative group animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 mx-auto max-w-5xl">
            <div className="absolute -inset-1 blur-3xl opacity-30 group-hover:opacity-60 transition duration-1000 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-[2.5rem] -z-10" />
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-950">
              <Image
                src={post.featuredImage}
                alt={post.title}
                width={1200}
                height={630}
                priority
                className="w-full aspect-[21/9] md:aspect-video object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        )}

        {/* ARTICLE CONTENT */}
        <article className="w-full min-w-0 relative max-w-3xl mx-auto bg-zinc-950/40 backdrop-blur-3xl border border-zinc-800/50 rounded-[2.5rem] p-6 md:p-12 lg:p-16 shadow-2xl overflow-hidden break-words">
          <RenderContent content={post.content || ""} />
        </article>

      </main>
    </div>
  );
}