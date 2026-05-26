import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <section className="section-shell grid min-h-[calc(100svh-4rem)] items-center">
      <div className="glass-panel mx-auto w-full max-w-md rounded-lg border p-6">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="mt-4 h-8 w-44" />
        <Skeleton className="mt-6 h-11 w-full" />
        <Skeleton className="mt-3 h-11 w-full" />
        <Skeleton className="mt-6 h-10 w-32" />
      </div>
    </section>
  );
}
