import { PostSectionSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <PostSectionSkeleton />
    </main>
  );
}
