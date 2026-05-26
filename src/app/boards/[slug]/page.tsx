import Link from "next/link";
import { notFound } from "next/navigation";
import { PenSquare } from "lucide-react";
import { PostCard } from "@/components/forum/post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAnonymousProfile, getBoard, getBoardPosts, getBoards, getProfiles, getUnknownBoard } from "@/lib/data";

export default async function BoardDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const { q, sort } = await searchParams;
  const board = await getBoard(slug);
  if (!board) notFound();

  const keyword = (q ?? "").trim().toLowerCase();
  const [posts, profiles, boards] = await Promise.all([getBoardPosts(board.id, { includeContent: Boolean(keyword) }), getProfiles(), getBoards()]);
  const filteredPosts = (keyword
    ? posts.filter((post) =>
        [post.title, post.excerpt, post.content, post.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      )
    : posts
  ).sort((a, b) => {
    if (sort === "hot") {
      return b.viewCount + b.replyCount * 5 + b.likeCount * 3 - (a.viewCount + a.replyCount * 5 + a.likeCount * 3);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <section className="section-shell">
      <Card className="glass-panel mb-5 overflow-hidden">
        <CardContent className="grid gap-5 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <Badge variant="teal">{board.group}</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">{board.name}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{board.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/publish">
                <PenSquare className="h-4 w-4" />
                发主题
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <form action={`/boards/${board.slug}`} className="mb-5 grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <Input aria-label="搜索本板块主题" defaultValue={q ?? ""} name="q" placeholder="搜索本板块主题" />
        <Button type="submit" name="sort" value="latest" variant={sort === "hot" ? "secondary" : "default"}>最新回复</Button>
        <Button type="submit" name="sort" value="hot" variant={sort === "hot" ? "default" : "secondary"}>热度优先</Button>
      </form>
      <div className="grid gap-4">
        {filteredPosts.length ? (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={profiles.find((profile) => profile.id === post.authorId) ?? getAnonymousProfile()}
              board={boards.find((item) => item.id === post.boardId) ?? board ?? getUnknownBoard()}
            />
          ))
        ) : (
          <Card className="glass-panel">
            <CardContent className="p-6 text-sm text-muted-foreground">
              当前板块还没有主题。可以从这里发布第一篇讨论。
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
