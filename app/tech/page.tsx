import { CategoryPage, type CategorySearchParams } from "@/components/CategoryPage";
import { SECTIONS } from "@/lib/sections";

export const metadata = { title: SECTIONS["tech"].title };

export default function TechPage({ searchParams }: { searchParams: CategorySearchParams }) {
  return <CategoryPage section={SECTIONS["tech"]} searchParams={searchParams} />;
}
