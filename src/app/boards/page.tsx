import Link from "next/link";
import { BoardCard } from "@/components/forum/board-card";
import { AnimatedSection } from "@/components/motion/animated-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { getBoards } from "@/lib/data";

export default async function BoardsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const keyword = (q ?? "").trim().toLowerCase();
  const boards = await getBoards();
  const filteredBoards = keyword
    ? boards.filter((board) =>
        [board.name, board.group, board.description, board.slug].join(" ").toLowerCase().includes(keyword)
      )
    : boards;
  const groups = Array.from(new Set(filteredBoards.map((board) => board.group)));

  return (
    <section className="section-shell">
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_320px] md:items-end">
        <div>
          <Badge variant="outline">板块导航</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">按场景组织讨论</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">保留原系统 12 个板块，并改造成响应式卡片、图标和热度统计。</p>
        </div>
        <form action="/boards" className="flex gap-2">
          <Input aria-label="搜索板块" defaultValue={q ?? ""} name="q" placeholder="搜索板块名称、分区或描述" />
          <SubmitButton variant="secondary" pendingText="搜索中…">搜索</SubmitButton>
        </form>
      </div>
      <div className="space-y-8">
        {groups.length ? groups.map((group) => (
          <AnimatedSection key={group}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-lg font-semibold">{group}</h2>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredBoards.filter((board) => board.group === group).map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          </AnimatedSection>
        )) : (
          <Card className="glass-panel">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6 text-sm text-muted-foreground">
              没有找到匹配的板块。
              <Button asChild variant="glass" size="sm">
                <Link href="/boards">清除搜索</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
