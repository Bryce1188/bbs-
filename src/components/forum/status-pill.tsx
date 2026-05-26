import { Badge } from "@/components/ui/badge";

export function StatusPill({ status }: { status: string }) {
  const label =
    {
      pending: "待处理",
      resolved: "已处理",
      rejected: "已驳回",
      featured: "精华",
      pinned: "置顶",
      normal: "普通"
    }[status] ?? status;

  return <Badge variant={status === "pending" ? "amber" : status === "resolved" ? "teal" : "outline"}>{label}</Badge>;
}
