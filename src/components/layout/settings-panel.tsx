"use client";

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { LogIn, Settings2, ShieldCheck, UserCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

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

  return (
    <>
      <Button variant="glass" size="icon" aria-label="打开设置面板" onClick={() => setOpen(true)}>
        <Settings2 className="h-4 w-4" />
      </Button>
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-[72] bg-black/35 backdrop-blur-md"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={() => setOpen(false)}
            />
            <div className="pointer-events-none fixed inset-0 z-[73]">
              <motion.div
                className="absolute right-5 top-[4.5rem] h-px origin-right bg-foreground/80"
                initial={reduceMotion ? { width: 320, opacity: 1 } : { width: 48, opacity: 0.6 }}
                animate={{ width: 352, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { width: 48, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.section
                role="dialog"
                aria-modal="true"
                aria-label="设置面板"
                className="pointer-events-auto absolute right-4 top-20 w-[min(92vw,360px)] rounded-2xl border bg-background/92 p-4 shadow-glass backdrop-blur-2xl"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12, scale: 0.96, filter: "blur(10px)" }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98, filter: "blur(8px)" }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.04 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Quick Settings</p>
                    <h2 className="text-lg font-semibold">设置与账户</h2>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="关闭设置面板" onClick={() => setOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Button asChild variant="secondary" className="justify-start">
                    <Link href="/auth" onClick={() => setOpen(false)}>
                      <LogIn className="h-4 w-4" />
                      登录 / 注册
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/profile/admin" onClick={() => setOpen(false)}>
                      <UserCircle2 className="h-4 w-4" />
                      我的主页
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/admin" onClick={() => setOpen(false)}>
                      <ShieldCheck className="h-4 w-4" />
                      管理后台
                    </Link>
                  </Button>
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
