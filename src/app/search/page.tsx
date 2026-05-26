import { Search } from "lucide-react";
import Link from "next/link";
import { BoardCard } from "@/components/forum/board-card";
import { PostCard } from "@/components/forum/post-card";
import { UserAvatar } from "@/components/forum/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { getAnonymousProfile, getBoards, getPosts, getProfiles, getUnknownBoard } from "@/lib/data";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const keyword = (q ?? "").trim().toLowerCase();
  const [posts, profiles, boards] = await Promise.all([getPosts(50, { includeContent: Boolean(keyword) }), getProfiles(), getBoards()]);
  const filteredPosts = keyword
    ? posts.filter((post) =>
        [post.title, post.excerpt, post.content, post.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      )
    : posts;
  const filteredBoards = keyword
    ? boards.filter((board) => [board.name, board.group, board.description, board.slug].join(" ").toLowerCase().includes(keyword))
    : boards.slice(0, 4);
  const filteredProfiles = keyword
    ? profiles.filter((profile) =>
        [profile.username, profile.displayName, profile.level, profile.signature].join(" ").toLowerCase().includes(keyword)
      )
    : profiles.slice(0, 4);

  return (
    <section className="section-shell">
      <div className="mb-6">
        <Badge variant="outline">搜索</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">查找主题、板块和用户</h1>
      </div>
      <Card className="glass-panel mb-5">
        <CardContent className="p-4">
          <form action="/search" className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              aria-label="搜索关键词"
              className="border-0 bg-transparent focus-visible:ring-0"
              defaultValue={q ?? ""}
              name="q"
              placeholder="输入关键词"
            />
            <SubmitButton size="sm" pendingText="搜索中…">搜索</SubmitButton>
          </form>
        </CardContent>
      </Card>
      <div className="mb-5 grid gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">板块</Badge>
          <span className="text-sm text-muted-foreground">{filteredBoards.length} 个结果</span>
        </div>
        {filteredBoards.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredBoards.map((board) => <BoardCard key={board.id} board={board} />)}
          </div>
        ) : (
          <Card className="glass-panel">
            <CardContent className="p-5 text-sm text-muted-foreground">没有匹配的板块。</CardContent>
          </Card>
        )}
      </div>

      <div className="mb-5 grid gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">用户</Badge>
          <span className="text-sm text-muted-foreground">{filteredProfiles.length} 个结果</span>
        </div>
        {filteredProfiles.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProfiles.map((profile) => (
              <Link key={profile.id} href={`/profile/${profile.id}`}>
                <Card className="glass-panel h-full transition hover:border-primary/45">
                  <CardContent className="flex items-center gap-3 p-5">
                    <UserAvatar displayName={profile.displayName} avatar={profile.avatar} />
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold">{profile.displayName}</h2>
                      <p className="truncate text-xs text-muted-foreground">{profile.level}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="glass-panel">
            <CardContent className="p-5 text-sm text-muted-foreground">没有匹配的用户。</CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">主题</Badge>
          <span className="text-sm text-muted-foreground">{filteredPosts.length} 个结果</span>
        </div>
        {filteredPosts.length ? (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={profiles.find((profile) => profile.id === post.authorId) ?? getAnonymousProfile()}
              board={boards.find((board) => board.id === post.boardId) ?? getUnknownBoard()}
            />
          ))
        ) : (
          <Card className="glass-panel">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6 text-sm text-muted-foreground">
              没有找到匹配的主题。
              <Button asChild variant="glass" size="sm">
                <Link href="/search">清除搜索</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
