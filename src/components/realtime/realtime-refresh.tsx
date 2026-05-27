"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRealtimeSocket } from "@/lib/realtime/client";

type RealtimeRefreshProps = {
  table: "private_messages" | "notifications" | "posts" | "post_replies";
};

export function RealtimeRefresh({ table }: RealtimeRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!["private_messages", "notifications"].includes(table)) return;
    const socket = getRealtimeSocket();

    let timer: number | undefined;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => router.refresh(), 250);
    };

    socket.on("message:new", refresh);
    socket.on("notification:new", refresh);
    socket.on("notification:read", refresh);

    return () => {
      window.clearTimeout(timer);
      socket.off("message:new", refresh);
      socket.off("notification:new", refresh);
      socket.off("notification:read", refresh);
    };
  }, [router, table]);

  return null;
}
