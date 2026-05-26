"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const tickTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const clearTimers = useCallback(() => {
    if (tickTimerRef.current) window.clearInterval(tickTimerRef.current);
    if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);
    tickTimerRef.current = null;
    finishTimerRef.current = null;
  }, []);

  const startProgress = useCallback(() => {
    setVisible(true);
    setProgress((current) => (current > 12 ? current : 12));
    if (tickTimerRef.current) return;
    tickTimerRef.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return current;
        return current + Math.max(2, (90 - current) * 0.08);
      });
    }, 160);
  }, []);

  const finishProgress = useCallback(() => {
    clearTimers();
    setProgress(100);
    finishTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 180);
  }, [clearTimers]);

  useEffect(() => {
    const timer = window.setTimeout(() => finishProgress(), 0);
    return () => window.clearTimeout(timer);
  }, [pathname, searchParams, finishProgress]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      startProgress();
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      clearTimers();
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [clearTimers, startProgress]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5">
      {visible ? (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0.9 }}
          animate={{ width: `${progress}%`, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.16, ease: "easeOut" }}
          className="h-full rounded-r-full bg-foreground/90"
        />
      ) : null}
    </div>
  );
}
