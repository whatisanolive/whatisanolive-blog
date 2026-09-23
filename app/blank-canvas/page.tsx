import { CategoryPage, type CategorySearchParams } from "@/components/CategoryPage";
import { SECTIONS } from "@/lib/sections";

export const metadata = { title: SECTIONS["blank-canvas"].title };

export default function BlankCanvasPage({ searchParams }: { searchParams: CategorySearchParams }) {
  return <CategoryPage section={SECTIONS["blank-canvas"]} searchParams={searchParams} />;
}
