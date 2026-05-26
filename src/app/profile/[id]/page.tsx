import { CalendarDays, Mail, MessageSquare, UserPlus } from "lucide-react";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/forum/post-card";
import { UserAvatar } from "@/components/forum/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/app/actions";
import { getBoards, getCurrentUserId, getProfile, getProfilePosts, getUnknownBoard } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, authoredPosts, boards, currentUserId] = await Promise.all([getProfile(id), getProfilePosts(id), getBoards(), getCurrentUserId()]);
  if (!profile) notFound();
  const isSelf = currentUserId === profile.id;

  return (
    <section className="section-shell">
      <Card className="glass-panel overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <UserAvatar displayName={profile.displayName} avatar={profile.avatar} className="h-24 w-24" fallbackClassName="text-3xl" />
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
      {isSelf ? (
        <Card className="glass-panel mt-5">
          <CardContent className="p-5">
            <form action={updateProfileAction} className="grid gap-3">
              <h2 className="font-semibold">修改用户信息</h2>
              <label className="grid gap-1.5 text-sm font-medium" htmlFor="profile-display-name">
                名字
                <Input id="profile-display-name" name="displayName" defaultValue={profile.displayName} />
              </label>
              <label className="grid gap-1.5 text-sm font-medium" htmlFor="profile-signature">
                签名
                <Textarea id="profile-signature" name="signature" defaultValue={profile.signature} />
              </label>
              <SubmitButton className="justify-self-start" pendingText="保存中…">保存资料</SubmitButton>
            </form>
          </CardContent>
        </Card>
      ) : null}
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
