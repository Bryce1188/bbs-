import { ListCardSkeleton, PageHeroSkeleton } from "@/components/layout/page-skeletons";

export default function BoardsLoading() {
  return (
    <section className="section-shell">
      <PageHeroSkeleton />
      <ListCardSkeleton count={8} />
    </section>
  );
}
