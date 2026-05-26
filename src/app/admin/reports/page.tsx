import Link from "next/link";
import { StatusPill } from "@/components/forum/status-pill";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateReportStatusAction } from "@/app/actions";
import { getReports } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminReportsPage() {
  const reports = await getReports();

  return (
    <section className="section-shell">
      <div className="mb-6">
        <Badge variant="outline">举报管理</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">举报、处理与申诉</h1>
      </div>
      <Card className="glass-panel overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[680px]">
              <TableHeader className="bg-muted/70">
                <TableRow className="hover:bg-transparent">
                  <TableHead>帖子</TableHead>
                  <TableHead>原因</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium"><Link href={`/posts/${report.postId}`}>#{report.postId}</Link></TableCell>
                  <TableCell className="text-muted-foreground">{report.reason}</TableCell>
                  <TableCell><StatusPill status={report.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(report.createdAt)}</TableCell>
                  <TableCell>
                    <form action={updateReportStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="reportId" value={report.id} />
                      <Select name="status" defaultValue={report.status}>
                        <SelectTrigger className="h-9 w-36" aria-label="举报状态">
                          <SelectValue placeholder="选择状态" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="resolved">resolved</SelectItem>
                          <SelectItem value="rejected">rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <SubmitButton size="sm" variant="secondary" pendingText="处理中…">处理</SubmitButton>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
