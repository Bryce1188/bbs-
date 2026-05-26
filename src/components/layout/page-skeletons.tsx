import { Skeleton } from "@/components/ui/skeleton";

export function PageHeroSkeleton() {
  return (
    <div className="mb-6 space-y-3">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-10 w-72 max-w-full" />
      <Skeleton className="h-4 w-[28rem] max-w-full" />
    </div>
  );
}

export function ListCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-panel rounded-lg border p-5">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="glass-panel overflow-hidden rounded-lg border">
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
