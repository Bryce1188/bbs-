import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageAlert } from "@/components/ui/page-alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { createNoticeAction } from "@/app/actions";
import { getBoards, getNotices } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const ERROR_TEXT: Record<string, string> = {
  invalid_notice: "公告参数校验失败，请检查后重试。",
  create_failed: "公告发布失败，请稍后重试。"
};

export default async function AdminNoticesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const [boards, notices] = await Promise.all([getBoards(), getNotices()]);

  return (
    <section className="section-shell">
      {error && ERROR_TEXT[error] ? <PageAlert tone="error" message={ERROR_TEXT[error]} /> : null}
      <Badge variant="outline">公告管理</Badge>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal">发布社区公告</h1>
      <Card className="glass-panel mt-6">
        <CardContent className="p-6">
          <form action={createNoticeAction} className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="notice-title">
              公告标题
              <Input id="notice-title" name="title" placeholder="公告标题" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              关联板块
              <Select name="boardId" defaultValue="all">
                <SelectTrigger aria-label="选择板块">
                  <SelectValue placeholder="全站公告" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全站公告</SelectItem>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={String(board.id)}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="notice-content">
              公告内容
              <Textarea id="notice-content" name="content" placeholder="公告内容" />
            </label>
            <SubmitButton className="justify-self-start" pendingText="发布中…">发布公告</SubmitButton>
          </form>
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-3">
        {notices.map((notice) => (
          <Card key={notice.id} className="glass-panel">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">{notice.title}</h2>
                <Badge variant={notice.active ? "teal" : "outline"}>{notice.active ? "生效中" : "已下线"}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{notice.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatDate(notice.createdAt)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
