import { ListCardSkeleton, PageHeroSkeleton } from "@/components/layout/page-skeletons";

export default function MessagesLoading() {
  return (
    <section className="section-shell">
      <PageHeroSkeleton />
      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <ListCardSkeleton count={3} />
        <ListCardSkeleton count={3} />
      </div>
    </section>
  );
}
