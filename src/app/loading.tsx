import { ListCardSkeleton, PageHeroSkeleton } from "@/components/layout/page-skeletons";

export default function Loading() {
  return (
    <section className="section-shell">
      <PageHeroSkeleton />
      <ListCardSkeleton count={5} />
    </section>
  );
}
