import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { toggleReplyVisibilityAction } from "@/app/actions";
import { getReplies } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminCommentsPage() {
  const replies = await getReplies();

  return (
    <section className="section-shell">
      <Badge variant="outline">评论管理</Badge>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal">回复审核与清理</h1>
      <div className="mt-6 grid gap-4">
        {replies.map((reply) => (
          <Card key={reply.id} className="glass-panel">
            <CardContent className="p-5">
              <p className="text-sm leading-6">{reply.content}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  主题 #{reply.postId} · {formatDate(reply.createdAt)} · {reply.visible ? "可见" : "已隐藏"}
                </p>
                <form action={toggleReplyVisibilityAction}>
                  <input type="hidden" name="replyId" value={reply.id} />
                  <input type="hidden" name="visible" value={reply.visible ? "false" : "true"} />
                  <SubmitButton size="sm" variant="secondary" pendingText="处理中…">
                    {reply.visible ? "隐藏" : "恢复显示"}
                  </SubmitButton>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
