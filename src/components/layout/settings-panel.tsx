"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { LogIn, LogOut, Settings2, ShieldCheck, UserCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? "");
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? "");
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? "");
    });

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = "/";
  }

  return (
    <>
      <Button variant="glass" size="icon" aria-label="打开设置面板" onClick={() => setOpen(true)}>
        <Settings2 className="h-4 w-4" />
      </Button>
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-[72] bg-black/18 backdrop-blur-sm"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={() => setOpen(false)}
            />
            <div className="pointer-events-none fixed inset-0 z-[73]">
              <motion.div
                className="absolute right-6 top-[4.6rem] h-px origin-right bg-foreground/70"
                initial={reduceMotion ? { width: 96, opacity: 1 } : { width: 36, opacity: 0.45 }}
                animate={{ width: 96, opacity: 0.8 }}
                exit={reduceMotion ? { opacity: 0 } : { width: 36, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.section
                role="dialog"
                aria-modal="true"
                aria-label="设置面板"
                className="pointer-events-auto absolute right-4 top-20 w-[min(92vw,360px)] rounded-2xl border bg-background/95 p-4 shadow-glass backdrop-blur-2xl"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12, scale: 0.96, filter: "blur(10px)" }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98, filter: "blur(8px)" }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.04 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Quick Settings</p>
                    <h2 className="text-lg font-semibold">设置与账户</h2>
                    {userId ? (
                      <p className="mt-1 text-xs text-muted-foreground">已登录：{userEmail || "当前账号"}</p>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">未登录，可先登录后使用账号功能。</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" aria-label="关闭设置面板" onClick={() => setOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-2">
                  {userId ? null : (
                    <Button asChild variant="secondary" className="justify-start">
                      <Link href="/auth" onClick={() => setOpen(false)}>
                        <LogIn className="h-4 w-4" />
                        登录 / 注册
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href={userId ? `/profile/${userId}` : "/auth"} onClick={() => setOpen(false)}>
                      <UserCircle2 className="h-4 w-4" />
                      {userId ? "我的主页" : "先去登录"}
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/admin" onClick={() => setOpen(false)}>
                      <ShieldCheck className="h-4 w-4" />
                      管理后台
                    </Link>
                  </Button>
                  {userId ? (
                    <Button variant="ghost" className="justify-start text-destructive hover:text-destructive" onClick={signOut}>
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </Button>
                  ) : null}
                </div>

                <div className="mt-4 border-t pt-4">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">界面设置</p>
                  <div className="flex flex-wrap gap-2">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
                </div>
              </motion.section>
            </div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
