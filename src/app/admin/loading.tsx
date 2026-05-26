import { PageHeroSkeleton, TableSkeleton } from "@/components/layout/page-skeletons";

export default function AdminLoading() {
  return (
    <section className="section-shell">
      <PageHeroSkeleton />
      <TableSkeleton rows={8} />
    </section>
  );
}
