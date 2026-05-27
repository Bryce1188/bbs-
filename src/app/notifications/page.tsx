import { BellRing, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageAlert } from "@/components/ui/page-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { markAllNotificationsReadAction } from "@/app/actions";
import { getNotifications } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const NOTICE_TEXT: Record<string, string> = {
  all_read: "通知已全部标记为已读。"
};

const ERROR_TEXT: Record<string, string> = {
  mark_failed: "标记已读失败，请稍后重试。"
};

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const { notice, error } = await searchParams;
  const notifications = await getNotifications();

  return (
    <section className="section-shell">
      <RealtimeRefresh table="notifications" />
      {notice && NOTICE_TEXT[notice] ? <PageAlert tone="success" message={NOTICE_TEXT[notice]} /> : null}
      {error && ERROR_TEXT[error] ? <PageAlert tone="error" message={ERROR_TEXT[error]} /> : null}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Badge variant="outline">通知</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">消息提醒</h1>
        </div>
        <form action={markAllNotificationsReadAction}>
          <SubmitButton variant="glass" pendingText="处理中…">
            <CheckCircle2 className="h-4 w-4" />
            全部已读
          </SubmitButton>
        </form>
      </div>
      <div className="grid gap-4">
        {notifications.length ? notifications.map((item) => (
          <Card key={item.id} className="glass-panel">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <BellRing className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{item.title}</h2>
                  {!item.read ? <Badge variant="amber">未读</Badge> : <Badge variant="outline">已读</Badge>}
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="glass-panel">
            <CardContent className="p-6 text-sm text-muted-foreground">暂无通知。登录后会从 MySQL 读取你的提醒。</CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
