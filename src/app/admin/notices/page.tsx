import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createNoticeAction } from "@/app/actions";
import { getBoards, getNotices } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminNoticesPage() {
  const [boards, notices] = await Promise.all([getBoards(), getNotices()]);

  return (
    <section className="section-shell">
      <Badge variant="teal">公告管理</Badge>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal">发布社区公告</h1>
      <Card className="glass-panel mt-6">
        <CardContent className="p-6">
          <form action={createNoticeAction} className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="notice-title">
              公告标题
              <Input id="notice-title" name="title" placeholder="公告标题" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="notice-board">
              关联板块
              <select id="notice-board" name="boardId" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">全站公告</option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>{board.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="notice-content">
              公告内容
              <Textarea id="notice-content" name="content" placeholder="公告内容" />
            </label>
            <Button type="submit" className="justify-self-start">发布公告</Button>
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
