import Link from "next/link";
import { StatusPill } from "@/components/forum/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateReportStatusAction } from "@/app/actions";
import { getReports } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminReportsPage() {
  const reports = await getReports();

  return (
    <section className="section-shell">
      <div className="mb-6">
        <Badge variant="teal">举报管理</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">举报、处理与申诉</h1>
      </div>
      <Card className="glass-panel overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full text-sm">
            <thead className="bg-muted/70 text-left">
              <tr>
                <th className="p-4">帖子</th>
                <th className="p-4">原因</th>
                <th className="p-4">状态</th>
                <th className="p-4">时间</th>
                <th className="p-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t">
                  <td className="p-4 font-medium"><Link href={`/posts/${report.postId}`}>#{report.postId}</Link></td>
                  <td className="p-4 text-muted-foreground">{report.reason}</td>
                  <td className="p-4"><StatusPill status={report.status} /></td>
                  <td className="p-4 text-muted-foreground">{formatDate(report.createdAt)}</td>
                  <td className="p-4">
                    <form action={updateReportStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="reportId" value={report.id} />
                      <select name="status" defaultValue={report.status} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                        <option value="pending">pending</option>
                        <option value="resolved">resolved</option>
                        <option value="rejected">rejected</option>
                      </select>
                      <Button type="submit" size="sm" variant="secondary">处理</Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
