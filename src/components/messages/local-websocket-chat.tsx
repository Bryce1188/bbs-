"use client";

import { SendHorizontal, Wifi, WifiOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Message, Profile } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type LocalWebSocketChatProps = {
  currentUserId: string;
  profiles: Profile[];
  initialMessages: Message[];
  activePeerId?: string;
};

type SocketEvent =
  | { type: "init"; messages: Message[]; onlineUsers: string[] }
  | { type: "message"; message: Message; level?: number }
  | { type: "presence"; onlineUsers: string[] }
  | { type: "error"; code: string; message: string; level?: number };

const LEVEL_TEXT: Record<number, string> = {
  0: "L0 黑名单",
  1: "L1 陌生人",
  2: "L2 单向关注",
  3: "L3 互相关注",
  4: "L4 好友",
  5: "L5 密友"
};

function mergeMessage(messages: Message[], next: Message) {
  const withoutCurrent = messages.filter((item) => item.id !== next.id);
  return [...withoutCurrent, next].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function LocalWebSocketChat({ currentUserId, profiles, initialMessages, activePeerId }: LocalWebSocketChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastLevel, setLastLevel] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const activePeer = profiles.find((profile) => profile.id === activePeerId);
  const activeMessages = useMemo(
    () => messages.filter((message) => message.peerId === activePeerId).slice().reverse(),
    [activePeerId, messages]
  );

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/messages?userId=${encodeURIComponent(currentUserId)}`);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      setConnected(true);
      setError(null);
    });
    ws.addEventListener("close", () => {
      setConnected(false);
    });
    ws.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data) as SocketEvent;
      if (payload.type === "init") {
        setMessages(payload.messages);
        setOnlineUsers(payload.onlineUsers);
      }
      if (payload.type === "message") {
        setMessages((current) => mergeMessage(current, payload.message));
        setLastLevel(payload.level ?? null);
        setError(null);
      }
      if (payload.type === "presence") {
        setOnlineUsers(payload.onlineUsers);
      }
      if (payload.type === "error") {
        setError(payload.message);
        setLastLevel(payload.level ?? null);
      }
    });

    return () => ws.close();
  }, [currentUserId]);

  function sendMessage() {
    if (!activePeerId || !content.trim() || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: "send_message",
        receiverId: activePeerId,
        content,
        time: Date.now(),
        clientMsgId: `${currentUserId}-${Date.now()}-${Math.random().toString(16).slice(2)}`
      })
    );
    setContent("");
  }

  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="font-semibold">{activePeer ? `与 ${activePeer.displayName} 的会话` : "选择一条会话"}</h2>
          <p className="text-xs text-muted-foreground">本地 WebSocket 网关：MVC 页面 + Service 权限策略 + MySQL DAO 持久化</p>
        </div>
        <Badge variant={connected ? "teal" : "secondary"} className="shrink-0">
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connected ? "已连接" : "离线"}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2 py-3 text-xs text-muted-foreground">
        <span>在线：{onlineUsers.length ? onlineUsers.join("、") : "无"}</span>
        {lastLevel !== null ? <Badge variant="outline">{LEVEL_TEXT[lastLevel] ?? `L${lastLevel}`}</Badge> : null}
      </div>
      {error ? <p className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      <div className="flex-1 space-y-4 overflow-y-auto py-2">
        {activeMessages.length ? (
          activeMessages.map((message) => (
            <div key={message.id} className={`flex ${message.fromSelf ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-lg p-3 text-sm leading-6 ${message.fromSelf ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {message.content}
                <p className="mt-1 text-[11px] opacity-70">{formatDate(message.createdAt)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">暂无可展示的消息。</p>
        )}
      </div>
      <div className="grid gap-3 pt-3">
        <label htmlFor="local-message-content" className="sr-only">
          输入私信内容
        </label>
        <Textarea
          id="local-message-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) sendMessage();
          }}
          placeholder="输入私信内容"
        />
        <Button disabled={!activePeerId || !connected || !content.trim()} className="justify-self-end" onClick={sendMessage}>
          <SendHorizontal className="h-4 w-4" />
          发送
        </Button>
      </div>
    </div>
  );
}
