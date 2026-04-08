export function PostCardSkeleton() {
  return (
    <div className="h-72 w-full bg-zinc-900/50 rounded-2xl animate-pulse" />
  );
}

export function PostSectionSkeleton() {
  return (
    <section className="w-full max-w-6xl mx-auto py-10 my-12 space-y-8">
      <div className="h-8 w-32 bg-zinc-900/50 rounded-md animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </section>
  );
}
