import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:220%_100%] animate-shimmer",
        className
      )}
    />
  );
}
