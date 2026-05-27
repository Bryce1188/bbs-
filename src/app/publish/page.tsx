import { ImagePlus, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageAlert } from "@/components/ui/page-alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { createPostAction } from "@/app/actions";
import { getBoards } from "@/lib/data";

const ERROR_TEXT: Record<string, string> = {
  invalid_post: "帖子参数校验失败，请检查标题、正文与板块。",
  create_failed: "帖子发布失败，请稍后重试。",
  db_not_configured: "当前环境未配置 MySQL，暂时无法发布。"
};

export default async function PublishPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const boards = await getBoards();

  return (
    <section className="section-shell">
      {error && ERROR_TEXT[error] ? <PageAlert tone="error" message={ERROR_TEXT[error]} /> : null}
      <div className="mb-6">
        <Badge variant="outline">发布主题</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">创建一篇新帖子</h1>
        <p className="mt-2 text-sm text-muted-foreground">表单会通过 Server Action 写入本地 MySQL；图片上传暂按路径字段存储。</p>
      </div>
      <Card className="glass-panel">
        <CardContent className="p-6">
          <form action={createPostAction} className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="post-title">
            标题
            <Input id="post-title" name="title" placeholder="用一句话说明主题" />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              板块
              <Select name="boardId" defaultValue={String(boards[0]?.id ?? "")}>
                <SelectTrigger aria-label="选择板块">
                  <SelectValue placeholder="选择板块" />
                </SelectTrigger>
                <SelectContent>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={String(board.id)}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="post-tags">
              标签
              <Input id="post-tags" name="tags" placeholder="Next.js, MySQL, 资源" />
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
            <SubmitButton pendingText="发布中…">
              <Send className="h-4 w-4" />
              发布帖子
            </SubmitButton>
          </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
