import { cn } from "@/lib/utils";

type PageAlertProps = {
  message: string;
  tone?: "success" | "error" | "info";
  className?: string;
};

export function PageAlert({ message, tone = "info", className }: PageAlertProps) {
  return (
    <div
      role="status"
      className={cn(
        "mb-4 rounded-md border px-4 py-3 text-sm",
        tone === "success" && "border-emerald-300/50 bg-emerald-100/70 text-emerald-900 dark:bg-emerald-300/15 dark:text-emerald-200",
        tone === "error" && "border-destructive/35 bg-destructive/10 text-destructive",
        tone === "info" && "border-border bg-muted/60 text-foreground",
        className
      )}
    >
      {message}
    </div>
  );
}
