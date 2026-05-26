"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Compass, MessageSquareText, ShieldCheck, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";

const steps = [
  { icon: Sparkles, title: "tourStepHeatTitle", text: "tourStepHeatText" },
  { icon: Compass, title: "tourStepBoardTitle", text: "tourStepBoardText" },
  { icon: MessageSquareText, title: "tourStepMessageTitle", text: "tourStepMessageText" },
  { icon: ShieldCheck, title: "tourStepAdminTitle", text: "tourStepAdminText" }
];

export function GuidedTour() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useI18n();
  const step = steps[index];
  const Icon = step.icon;

  const closeTour = useCallback(() => {
    window.localStorage.setItem("bbs-guided-tour", "done");
    setOpen(false);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const timer = window.setTimeout(() => {
      if (window.localStorage.getItem("bbs-guided-tour") !== "done") {
        setOpen(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeTour();
      }
      if (event.key === "Tab") {
        const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-tour-control='true']"));
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeTour, open]);

  return (
    <AnimatePresence>
      {open && pathname === "/" ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guided-tour-title"
          aria-describedby="guided-tour-text"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.98 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-50 w-[min(92vw,380px)] rounded-lg border bg-card/90 p-4 shadow-glass backdrop-blur-xl md:bottom-5 md:right-5"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 id="guided-tour-title" className="text-sm font-semibold">{t(step.title)}</h3>
                <Button
                  ref={closeButtonRef}
                  data-tour-control="true"
                  aria-label={t("closeGuide")}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={closeTour}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p id="guided-tour-text" aria-live="polite" className="mt-1 text-sm leading-6 text-muted-foreground">{t(step.text)}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex gap-1">
                  {steps.map((item, itemIndex) => (
                    <span key={item.title} className={`h-1.5 rounded-full ${itemIndex === index ? "w-6 bg-primary" : "w-2 bg-muted"}`} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button data-tour-control="true" size="sm" variant="ghost" onClick={closeTour}>
                    {t("skip")}
                  </Button>
                  <Button data-tour-control="true" size="sm" onClick={() => (index === steps.length - 1 ? closeTour() : setIndex(index + 1))}>
                    {index === steps.length - 1 ? t("finish") : t("next")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
