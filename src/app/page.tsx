import Link from "next/link";
import { Activity, ArrowRight, MessageCircle, Radio, Users } from "lucide-react";
import { AnimatedSection } from "@/components/motion/animated-section";
import { BoardCard } from "@/components/forum/board-card";
import { PostCard } from "@/components/forum/post-card";
import { StatCard } from "@/components/forum/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LocaleText } from "@/components/providers/i18n-provider";
import { getAnonymousProfile, getHomeData, getUnknownBoard } from "@/lib/data";

export default async function HomePage() {
  const { boards, posts, profiles, stats } = await getHomeData();
  const featured = posts.slice(0, 3);
  const boardPreview = boards.slice(0, 8);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="container grid min-h-[calc(100svh-4rem)] items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <AnimatedSection>
            <Badge variant="outline">
              <LocaleText id="homeBadge" />
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
              <LocaleText id="homeTitle" />
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              <LocaleText id="homeLead" />
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/boards">
                  <LocaleText id="browseBoards" />
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="glass">
                <Link href="/guide">
                  <LocaleText id="viewGuide" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.12}>
            <div className="glass-panel relative overflow-hidden rounded-lg p-4">
              <div className="absolute inset-x-8 top-0 h-px animate-line-drift bg-primary/70" />
              <div className="grid gap-3 sm:grid-cols-2">
                <StatCard label={<LocaleText id="registeredUsers" />} value={stats.users} icon={Users} hint="本地 MySQL users" />
                <StatCard label={<LocaleText id="totalPosts" />} value={stats.posts} icon={MessageCircle} hint="本地 MySQL posts" />
                <StatCard label={<LocaleText id="todayPosts" />} value={stats.todayPosts} icon={Activity} hint="今日新增主题" />
                <StatCard label={<LocaleText id="onlineMembers" />} value={stats.online} icon={Radio} hint="本地 WebSocket" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-shell">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <Badge variant="outline">Boards</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal">
              <LocaleText id="activeBoards" />
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/boards">
              <LocaleText id="allBoards" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {boardPreview.map((board, index) => (
            <AnimatedSection key={board.id} delay={index * 0.03}>
              <BoardCard board={board} />
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <Badge variant="outline">Featured</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal">
              <LocaleText id="featuredPosts" />
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/search">
              <LocaleText id="searchContent" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4">
          {featured.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={profiles.find((profile) => profile.id === post.authorId) ?? getAnonymousProfile()}
              board={boards.find((board) => board.id === post.boardId) ?? getUnknownBoard()}
            />
          ))}
        </div>
      </section>

      <section className="section-shell pb-14">
        <Card className="glass-panel overflow-hidden">
          <CardContent className="grid gap-5 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">
                <LocaleText id="courseDeploySplitTitle" />
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                <LocaleText id="courseDeploySplitText" />
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/admin">
                <LocaleText id="openAdmin" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
