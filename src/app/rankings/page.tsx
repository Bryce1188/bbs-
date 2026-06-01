import Link from "next/link";
import { Flame, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getHotTopics, getRankingProfiles } from "@/lib/data";
import { percent } from "@/lib/utils";

export default async function RankingsPage() {
  const [topPosts, profiles] = await Promise.all([getHotTopics(20), getRankingProfiles()]);
  const rankedProfiles = [...profiles].sort((a, b) => b.points - a.points || a.displayName.localeCompare(b.displayName));
  const maxPoints = Math.max(1, ...rankedProfiles.map((profile) => profile.points));

  return (
    <section className="section-shell">
      <div className="mb-6">
        <Badge variant="outline">榜单</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">社区排行榜</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="glass-panel">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2 font-semibold">
              <Trophy className="h-5 w-5 text-primary" />
              用户积分榜
            </div>
            <div className="space-y-4">
              {rankedProfiles.map((profile, index) => (
                <div key={profile.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{index + 1}. {profile.displayName}</span>
                    <span className="text-muted-foreground">{profile.points}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${percent(profile.points, maxPoints)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2 font-semibold">
              <Flame className="h-5 w-5 text-primary" />
              热门主题榜
            </div>
            <div className="space-y-3">
              {topPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-md bg-muted/50 p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex gap-3">
                    <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{post.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">浏览 {post.viewCount} · 点赞 {post.likeCount} · 回复 {post.replyCount}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
