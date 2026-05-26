"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type RealtimeRefreshProps = {
  table: "private_messages" | "notifications" | "posts" | "post_replies";
  filter?: string;
};

export function RealtimeRefresh({ table, filter }: RealtimeRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let timer: number | undefined;
    const channel = supabase
      .channel(`page-refresh:${table}:${filter ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filter ? { filter } : {})
        },
        () => {
          window.clearTimeout(timer);
          timer = window.setTimeout(() => router.refresh(), 350);
        }
      )
      .subscribe();

    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [filter, router, table]);

  return null;
}
