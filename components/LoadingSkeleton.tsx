export function PostCardSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-2xl border border-edge-soft bg-surface/60" />;
}

export function PostSectionSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-6 py-16">
      <div className="h-3 w-40 animate-pulse rounded bg-edge-soft" />
      <div className="h-12 w-72 animate-pulse rounded-lg bg-edge-soft" />
      <div className="grid gap-4 sm:grid-cols-2">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </section>
  );
}
