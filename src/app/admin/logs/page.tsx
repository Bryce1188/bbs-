import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { getAuditLogs } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 20;

export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<{ action?: string; page?: string }> }) {
  const { action, page } = await searchParams;
  const logs = await getAuditLogs();
  const keyword = (action ?? "").trim().toLowerCase();
  const filteredLogs = keyword ? logs.filter((log) => log.action.toLowerCase().includes(keyword)) : logs;
  const currentPage = Math.max(1, Number(page) || 1);
  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const visibleLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="section-shell">
      <Badge variant="outline">系统日志</Badge>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal">审计与操作记录</h1>
      <form action="/admin/logs" className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <Input name="action" defaultValue={action ?? ""} placeholder="按操作类型筛选，如 create_post" />
        <SubmitButton variant="secondary" pendingText="筛选中…">筛选</SubmitButton>
      </form>
      <div className="mt-6 grid gap-3">
        {visibleLogs.map((log) => (
          <Card key={log.id} className="glass-panel">
            <CardContent className="p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-medium">{log.action}</span>
                <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                actor: {log.actorId ?? "system"} · {log.targetType} #{log.targetId ?? "-"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>第 {currentPage} / {pageCount} 页，共 {filteredLogs.length} 条</span>
        <div className="flex gap-2">
          <Button asChild variant="glass" size="sm" aria-disabled={currentPage <= 1}>
            <a href={`/admin/logs?action=${encodeURIComponent(action ?? "")}&page=${Math.max(1, currentPage - 1)}`}>上一页</a>
          </Button>
          <Button asChild variant="glass" size="sm" aria-disabled={currentPage >= pageCount}>
            <a href={`/admin/logs?action=${encodeURIComponent(action ?? "")}&page=${Math.min(pageCount, currentPage + 1)}`}>下一页</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
