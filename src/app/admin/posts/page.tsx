import Link from "next/link";
import { StatusPill } from "@/components/forum/status-pill";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageAlert } from "@/components/ui/page-alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updatePostStatusAction } from "@/app/actions";
import { getPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const ERROR_TEXT: Record<string, string> = {
  invalid_post: "帖子参数校验失败，请检查后重试。",
  update_failed: "帖子状态更新失败，请稍后重试。"
};

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<{ q?: string; error?: string }> }) {
  const { q, error } = await searchParams;
  const posts = await getPosts();
  const keyword = (q ?? "").trim().toLowerCase();
  const filteredPosts = keyword
    ? posts.filter((post) => [post.title, post.excerpt, post.tags.join(" "), post.status].join(" ").toLowerCase().includes(keyword))
    : posts;

  return (
    <section className="section-shell">
      {error && ERROR_TEXT[error] ? <PageAlert tone="error" message={ERROR_TEXT[error]} /> : null}
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_320px] md:items-end">
        <div>
          <Badge variant="outline">帖子管理</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">主题审核与内容运营</h1>
        </div>
        <form action="/admin/posts" className="flex gap-2">
          <Input aria-label="搜索标题、作者或标签" name="q" defaultValue={q ?? ""} placeholder="搜索标题、作者或标签" />
          <SubmitButton variant="secondary" pendingText="搜索中…">搜索</SubmitButton>
        </form>
      </div>
      <Card className="glass-panel overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader className="bg-muted/70">
                <TableRow className="hover:bg-transparent">
                  <TableHead>标题</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>回复</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <Link href={`/posts/${post.id}`} className="hover:text-primary">{post.title}</Link>
                  </TableCell>
                  <TableCell><StatusPill status={post.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{post.replyCount}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(post.updatedAt)}</TableCell>
                  <TableCell>
                    <form action={updatePostStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="postId" value={post.id} />
                      <Select name="status" defaultValue={post.status}>
                        <SelectTrigger className="h-9 w-36" aria-label="帖子状态">
                          <SelectValue placeholder="选择状态" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">normal</SelectItem>
                          <SelectItem value="pinned">pinned</SelectItem>
                          <SelectItem value="featured">featured</SelectItem>
                        </SelectContent>
                      </Select>
                      <SubmitButton size="sm" variant="secondary" pendingText="更新中…">更新</SubmitButton>
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
