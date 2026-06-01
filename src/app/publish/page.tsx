import { ImagePlus, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageAlert } from "@/components/ui/page-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { createPostAction } from "@/app/actions";
import { getBoards } from "@/lib/data";

const ERROR_TEXT: Record<string, string> = {
  invalid_post: "发帖失败，请检查标题、板块、正文或图片格式。",
  create_failed: "发帖失败，请稍后重试。",
  db_not_configured: "数据库未配置，暂时无法发帖。"
};

export default async function PublishPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const boards = await getBoards();

  return (
    <section className="section-shell">
      {error && ERROR_TEXT[error] ? <PageAlert tone="error" message={ERROR_TEXT[error]} /> : null}

      <div className="mb-6">
        <Badge variant="outline">发布主题</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">创建新帖子</h1>
        <p className="mt-2 text-sm text-muted-foreground">支持上传 1 张图片（JPG / PNG / WebP / GIF，最大 5MB）。</p>
      </div>

      <Card className="glass-panel">
        <CardContent className="p-6">
          <form action={createPostAction} encType="multipart/form-data" className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="post-title">
              标题
              <Input id="post-title" name="title" placeholder="用一句话概括你的问题" required />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor="post-board">
              板块
              <select
                id="post-board"
                name="boardId"
                defaultValue={String(boards[0]?.id ?? "")}
                required
                className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {boards.map((board) => (
                  <option key={board.id} value={String(board.id)}>
                    {board.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor="post-content">
              正文
              <Textarea
                id="post-content"
                name="content"
                className="min-h-64"
                placeholder="把你的问题描述清楚，便于大家帮你解决。"
                required
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor="post-image">
              上传图片（可选）
              <div className="flex items-center gap-2 rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                <ImagePlus className="h-4 w-4" />
                <span>选择图片文件后随帖子一起发布</span>
              </div>
              <Input id="post-image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
            </label>

            <div className="flex justify-end">
              <SubmitButton pendingText="发布中...">
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

