import { CalendarDays, Mail, MessageSquare, UserPlus } from "lucide-react";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/forum/post-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBoards, getProfile, getProfilePosts, getUnknownBoard } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, authoredPosts, boards] = await Promise.all([getProfile(id), getProfilePosts(id), getBoards()]);
  if (!profile) notFound();

  return (
    <section className="section-shell">
      <Card className="glass-panel overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-3xl">{profile.displayName.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <Badge variant={profile.role === "admin" ? "teal" : "outline"}>{profile.role}</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">{profile.displayName}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{profile.signature}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(profile.joinedAt)}
              </span>
              <span>{profile.level}</span>
              <span>{formatNumber(profile.points)} 积分</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:flex-col">
            <Button>
              <UserPlus className="h-4 w-4" />
              关注
            </Button>
            <Button variant="glass">
              <Mail className="h-4 w-4" />
              私信
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">TA 的主题</h2>
      </div>
      <div className="mt-4 grid gap-4">
        {authoredPosts.length ? (
          authoredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={profile}
              board={boards.find((board) => board.id === post.boardId) ?? getUnknownBoard()}
            />
          ))
        ) : (
          <Card className="glass-panel">
            <CardContent className="p-6 text-sm text-muted-foreground">TA 还没有公开主题。</CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
