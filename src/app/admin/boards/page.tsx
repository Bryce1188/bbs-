import { BoardIcon } from "@/components/forum/board-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { updateBoardAction } from "@/app/actions";
import { getBoards } from "@/lib/data";

export default async function AdminBoardsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const boards = await getBoards();
  const keyword = (q ?? "").trim().toLowerCase();
  const filteredBoards = keyword
    ? boards.filter((board) => [board.name, board.group, board.description, board.slug].join(" ").toLowerCase().includes(keyword))
    : boards;

  return (
    <section className="section-shell">
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_320px] md:items-end">
        <div>
          <Badge variant="outline">板块管理</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">分区、排序与图标</h1>
        </div>
        <form action="/admin/boards" className="flex gap-2">
          <Input aria-label="搜索板块" name="q" defaultValue={q ?? ""} placeholder="搜索板块" />
          <SubmitButton variant="secondary" pendingText="搜索中…">搜索</SubmitButton>
        </form>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBoards.map((board) => (
          <Card key={board.id} className="glass-panel">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <BoardIcon name={board.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">{board.name}</h2>
                  <p className="text-xs text-muted-foreground">{board.group}</p>
                </div>
              </div>
              <form action={updateBoardAction} className="mt-4 grid gap-3">
                <input type="hidden" name="boardId" value={board.id} />
                <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                  名称
                  <Input name="name" defaultValue={board.name} />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                    分区
                    <Input name="group" defaultValue={board.group} />
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                    排序
                    <Input name="sortOrder" type="number" min={0} defaultValue={board.sortOrder} />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                    图标
                    <Input name="icon" defaultValue={board.icon} />
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                    主题色
                    <Input name="themeColor" defaultValue={board.themeColor} />
                  </label>
                </div>
                <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                  描述
                  <Textarea name="description" defaultValue={board.description} className="min-h-20" />
                </label>
                <SubmitButton size="sm" variant="secondary" className="justify-self-start" pendingText="保存中…">
                  保存板块
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
