import { Check, SendHorizontal, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/forum/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageAlert } from "@/components/ui/page-alert";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { respondFriendRequestAction, sendFriendRequestAction, sendMessageAction } from "@/app/actions";
import { getCurrentUserId, getFriendships, getMessages, getProfiles } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const NOTICE_TEXT: Record<string, string> = {
  message_sent: "消息已发送。",
  friend_requested: "好友申请已发送。",
  friend_accepted: "已通过好友申请。",
  friend_rejected: "已拒绝好友申请。"
};

const ERROR_TEXT: Record<string, string> = {
  invalid_message: "消息内容无效，请检查后重试。",
  send_failed: "消息发送失败，请稍后重试。",
  invalid_friend: "好友操作参数无效。",
  self_friend: "不能向自己发送好友申请。",
  friend_failed: "好友操作失败，请稍后重试。"
};

export default async function MessagesPage({
  searchParams
}: {
  searchParams: Promise<{ peer?: string; userQ?: string; notice?: string; error?: string }>;
}) {
  const { peer, userQ, notice, error } = await searchParams;
  const [messages, profiles, friendships, currentUserId] = await Promise.all([getMessages(), getProfiles(), getFriendships(), getCurrentUserId()]);
  const peers = Array.from(new Set(messages.map((message) => message.peerId)));
  const profileIds = new Set(profiles.map((profile) => profile.id));
  const activePeerId = peer && profileIds.has(peer) ? peer : peers[0];
  const activePeer = profiles.find((profile) => profile.id === activePeerId);
  const activeMessages = activePeerId ? messages.filter((message) => message.peerId === activePeerId).reverse() : [];
  const friendKeyword = (userQ ?? "").trim().toLowerCase();
  const candidateProfiles = friendKeyword
    ? profiles
        .filter((profile) => profile.id !== currentUserId)
        .filter((profile) => [profile.username, profile.displayName, profile.signature].join(" ").toLowerCase().includes(friendKeyword))
        .slice(0, 5)
    : [];
  const pendingRequests = friendships.filter((item) => item.status === "pending");
  const acceptedFriendIds = new Set(
    friendships
      .filter((item) => item.status === "accepted")
      .flatMap((item) => [item.requesterId, item.addresseeId])
      .filter((id) => id !== currentUserId)
  );
  const acceptedFriends = profiles.filter((profile) => acceptedFriendIds.has(profile.id));

  return (
    <section className="section-shell">
      <RealtimeRefresh table="private_messages" />
      {notice && NOTICE_TEXT[notice] ? <PageAlert tone="success" message={NOTICE_TEXT[notice]} /> : null}
      {error && ERROR_TEXT[error] ? <PageAlert tone="error" message={ERROR_TEXT[error]} /> : null}
      <div className="mb-6">
        <Badge variant="outline">Realtime</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">私信中心</h1>
        <p className="mt-2 text-sm text-muted-foreground">私信列表、好友申请和通知刷新已接入 Supabase Auth/RLS 与 Postgres Changes。</p>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="glass-panel min-w-0 overflow-hidden">
          <CardContent className="grid gap-3 p-4">
            <form action="/messages" className="flex gap-2">
              <Input aria-label="搜索用户" name="userQ" defaultValue={userQ ?? ""} placeholder="搜索用户加好友" />
              <SubmitButton size="sm" variant="secondary" pendingText="搜索中…">搜索</SubmitButton>
            </form>
            {candidateProfiles.length ? (
              <div className="grid gap-2 rounded-md border bg-muted/30 p-2">
                {candidateProfiles.map((profile) => (
                  <form key={profile.id} action={sendFriendRequestAction} className="flex items-center justify-between gap-3 rounded-md bg-background/70 p-2">
                    <input type="hidden" name="addresseeId" value={profile.id} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{profile.displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">{profile.signature}</p>
                    </div>
                    <SubmitButton size="sm" variant="glass" pendingText="发送中…">
                      <UserPlus className="h-4 w-4" />
                      添加
                    </SubmitButton>
                  </form>
                ))}
              </div>
            ) : null}
            {pendingRequests.length ? (
              <div className="grid gap-2 rounded-md border bg-muted/30 p-2">
                <p className="text-xs font-medium text-muted-foreground">好友申请</p>
                {pendingRequests.map((request) => {
                  const peerId = request.requesterId === currentUserId ? request.addresseeId : request.requesterId;
                  const requester = profiles.find((profile) => profile.id === request.requesterId);
                  const isIncoming = request.addresseeId === currentUserId;
                  return (
                    <div key={request.id} className="flex items-center justify-between gap-3 rounded-md bg-background/70 p-2">
                      <p className="min-w-0 truncate text-sm">{requester?.displayName ?? peerId}</p>
                      {isIncoming ? (
                        <form action={respondFriendRequestAction} className="flex gap-1">
                          <input type="hidden" name="friendshipId" value={request.id} />
                          <SubmitButton size="icon" className="h-8 w-8" name="status" value="accepted" aria-label="接受好友申请" pendingText="">
                            <Check className="h-4 w-4" />
                          </SubmitButton>
                          <SubmitButton
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            name="status"
                            value="rejected"
                            aria-label="拒绝好友申请"
                            pendingText=""
                          >
                            <X className="h-4 w-4" />
                          </SubmitButton>
                        </form>
                      ) : (
                        <Badge variant="outline">等待确认</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
            {acceptedFriends.length ? (
              <div className="grid gap-2 rounded-md border bg-muted/30 p-2">
                <p className="text-xs font-medium text-muted-foreground">好友</p>
                {acceptedFriends.map((friend) => (
                  <Link key={friend.id} href={`/messages?peer=${friend.id}`} className="rounded-md bg-background/70 p-2 text-sm transition hover:bg-muted">
                    {friend.displayName}
                  </Link>
                ))}
              </div>
            ) : null}
            {peers.length ? peers.map((peerId) => {
              const message = messages.find((item) => item.peerId === peerId);
              const peer = profiles.find((profile) => profile.id === peerId);
              if (!message || !peer) return null;
              return (
                <Link
                  key={peerId}
                  href={`/messages?peer=${peerId}`}
                  className={`flex items-center gap-3 rounded-md p-3 transition hover:bg-muted/70 ${peerId === activePeerId ? "bg-muted/70" : ""}`}
                >
                  <UserAvatar displayName={peer.displayName} avatar={peer.avatar} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{peer.displayName}</p>
                      {message.unread ? <Badge variant="teal">{message.unread}</Badge> : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{message.content}</p>
                  </div>
                </Link>
              );
            }) : (
              <p className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">暂无会话。登录后会从 Supabase 读取你的私信。</p>
            )}
          </CardContent>
        </Card>
        <Card className="glass-panel min-h-[520px] min-w-0 overflow-hidden">
          <CardContent className="flex h-full flex-col p-5">
            <div className="border-b pb-4">
              <h2 className="font-semibold">{activePeer ? `与 ${activePeer.displayName} 的会话` : "选择一条会话"}</h2>
              <p className="text-xs text-muted-foreground">在线状态由 Realtime Presence 提供</p>
            </div>
            <div className="flex-1 space-y-4 py-5">
              {activeMessages.length ? activeMessages.map((message) => (
                <div key={message.id} className={`flex ${message.fromSelf ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-lg p-3 text-sm leading-6 ${message.fromSelf ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {message.content}
                    <p className="mt-1 text-[11px] opacity-70">{formatDate(message.createdAt)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">暂无可展示的消息。</p>
              )}
            </div>
            <form action={sendMessageAction} className="grid gap-3">
              <input type="hidden" name="receiverId" value={activePeerId ?? ""} />
              <label htmlFor="message-content" className="sr-only">输入私信内容</label>
              <Textarea id="message-content" name="content" placeholder="输入私信内容" />
              <SubmitButton disabled={!activePeerId} className="justify-self-end" pendingText="发送中…">
                <SendHorizontal className="h-4 w-4" />
                发送
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
