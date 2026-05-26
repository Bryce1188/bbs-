import { ImagePlus, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPostAction } from "@/app/actions";
import { getBoards } from "@/lib/data";

export default async function PublishPage() {
  const boards = await getBoards();

  return (
    <section className="section-shell">
      <div className="mb-6">
        <Badge variant="teal">发布主题</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">创建一篇新帖子</h1>
        <p className="mt-2 text-sm text-muted-foreground">表单会通过 Server Action 写入 Supabase；图片上传将在 Storage 签名上传流程接入后开放。</p>
      </div>
      <Card className="glass-panel">
        <CardContent className="p-6">
          <form action={createPostAction} className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="post-title">
            标题
            <Input id="post-title" name="title" placeholder="用一句话说明主题" />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="post-board">
              板块
              <select id="post-board" name="boardId" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              {boards.map((board) => (
                <option key={board.id} value={board.id}>{board.name}</option>
              ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="post-tags">
              标签
              <Input id="post-tags" name="tags" placeholder="Next.js, Supabase, 资源" />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="post-content">
            正文
            <Textarea id="post-content" name="content" className="min-h-64" placeholder="正文内容，支持后续接入 Tiptap 或 Markdown 编辑器" />
          </label>
          <div className="flex flex-wrap justify-between gap-3">
            <Button type="button" variant="glass" disabled title="Storage 签名上传接入后启用">
              <ImagePlus className="h-4 w-4" />
              上传图片
            </Button>
            <Button type="submit">
              <Send className="h-4 w-4" />
              发布帖子
            </Button>
          </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
