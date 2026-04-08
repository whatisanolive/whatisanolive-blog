import { PostSectionSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 bg-grid-white/[0.02] -z-10" />

      <main className="max-w-6xl mx-auto p-6 pb-24 space-y-24">
        {/* Placeholder for Hero Section if they add one */}

        <PostSectionSkeleton />
        <PostSectionSkeleton />
        <PostSectionSkeleton />
      </main>
    </div>
  );
}
