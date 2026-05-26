import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  ["用户管理", "/admin/users", "账号、状态、角色"],
  ["角色权限", "/admin/roles", "管理员、版主、普通用户"],
  ["板块管理", "/admin/boards", "分区、图标、排序"],
  ["帖子管理", "/admin/posts", "状态调整与内容运营"],
  ["评论管理", "/admin/comments", "回复审核与可见性"],
  ["举报管理", "/admin/reports", "处理、驳回、申诉"],
  ["公告管理", "/admin/notices", "发布与状态查看"],
  ["系统日志", "/admin/logs", "审计记录追踪"]
];

export function AdminMatrix() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([name, href, desc]) => (
        <Link href={href} key={href}>
          <Card className="glass-panel h-full transition hover:-translate-y-1 hover:border-primary/45">
            <CardContent className="p-5">
              <Badge variant="outline">管理</Badge>
              <h3 className="mt-4 font-semibold">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
