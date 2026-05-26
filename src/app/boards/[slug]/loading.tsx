import { ListCardSkeleton, PageHeroSkeleton } from "@/components/layout/page-skeletons";

export default function BoardDetailLoading() {
  return (
    <section className="section-shell">
      <PageHeroSkeleton />
      <ListCardSkeleton count={6} />
    </section>
  );
}
