import Link from "next/link";
import { StatusPill } from "@/components/forum/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updatePostStatusAction } from "@/app/actions";
import { getPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const posts = await getPosts();
  const keyword = (q ?? "").trim().toLowerCase();
  const filteredPosts = keyword
    ? posts.filter((post) => [post.title, post.excerpt, post.tags.join(" "), post.status].join(" ").toLowerCase().includes(keyword))
    : posts;

  return (
    <section className="section-shell">
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_320px] md:items-end">
        <div>
          <Badge variant="teal">帖子管理</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">主题审核与内容运营</h1>
        </div>
        <form action="/admin/posts" className="flex gap-2">
          <Input aria-label="搜索标题、作者或标签" name="q" defaultValue={q ?? ""} placeholder="搜索标题、作者或标签" />
          <Button type="submit" variant="secondary">搜索</Button>
        </form>
      </div>
      <Card className="glass-panel overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-muted/70 text-left">
              <tr>
                <th className="p-4">标题</th>
                <th className="p-4">状态</th>
                <th className="p-4">回复</th>
                <th className="p-4">更新时间</th>
                <th className="p-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} className="border-t">
                  <td className="p-4 font-medium">
                    <Link href={`/posts/${post.id}`} className="hover:text-primary">{post.title}</Link>
                  </td>
                  <td className="p-4"><StatusPill status={post.status} /></td>
                  <td className="p-4 text-muted-foreground">{post.replyCount}</td>
                  <td className="p-4 text-muted-foreground">{formatDate(post.updatedAt)}</td>
                  <td className="p-4">
                    <form action={updatePostStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="postId" value={post.id} />
                      <select name="status" defaultValue={post.status} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                        <option value="normal">normal</option>
                        <option value="pinned">pinned</option>
                        <option value="featured">featured</option>
                      </select>
                      <Button type="submit" size="sm" variant="secondary">更新</Button>
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
