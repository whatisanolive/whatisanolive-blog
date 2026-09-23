import { CategoryPage, type CategorySearchParams } from "@/components/CategoryPage";
import { SECTIONS } from "@/lib/sections";

export const metadata = { title: SECTIONS["dsa"].title };

export default function DSAPage({ searchParams }: { searchParams: CategorySearchParams }) {
  return <CategoryPage section={SECTIONS["dsa"]} searchParams={searchParams} />;
}
