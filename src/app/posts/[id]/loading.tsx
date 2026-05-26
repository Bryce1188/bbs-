import { ListCardSkeleton, PageHeroSkeleton } from "@/components/layout/page-skeletons";

export default function PostDetailLoading() {
  return (
    <section className="section-shell">
      <PageHeroSkeleton />
      <ListCardSkeleton count={4} />
    </section>
  );
}
