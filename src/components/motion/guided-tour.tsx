"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Compass, MessageSquareText, ShieldCheck, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useI18n();
  const step = steps[index];
  const Icon = step.icon;

  const closeTour = useCallback(() => {
    window.localStorage.setItem("bbs-guided-tour", "done");
    setOpen(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.localStorage.getItem("bbs-guided-tour") !== "done") {
        setOpen(true);
      }
    }, 800); // Fades in slightly after page load for better UX

    return () => window.clearTimeout(timer);
  }, []);

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
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guided-tour-title"
          aria-describedby="guided-tour-text"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 30, scale: 0.96, filter: "blur(10px)" }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 15, scale: 0.96, filter: "blur(10px)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-50 w-[min(92vw,380px)] rounded-lg border bg-card/90 p-4 shadow-glass backdrop-blur-xl md:bottom-5 md:right-5"
        >
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              {/* Soft glowing background aura */}
              <span className="absolute inset-0 -z-10 rounded-md bg-primary/20 blur-md animate-pulse" />
              <div className="rounded-md bg-primary/10 p-2 text-primary h-9 w-9 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.6, rotate: -25 }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: 25 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1 relative h-5 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.h3
                      key={index}
                      id="guided-tour-title"
                      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="text-sm font-semibold absolute inset-0 truncate text-foreground"
                    >
                      {t(step.title)}
                    </motion.h3>
                  </AnimatePresence>
                </div>
                <Button
                  ref={closeButtonRef}
                  data-tour-control="true"
                  aria-label={t("closeGuide")}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full transition-transform active:scale-90"
                  onClick={closeTour}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 min-h-[56px] relative">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={index}
                    id="guided-tour-text"
                    aria-live="polite"
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 12, filter: "blur(4px)" }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -12, filter: "blur(4px)" }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="text-sm leading-6 text-muted-foreground"
                  >
                    {t(step.text)}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 pt-2 border-t border-border/40">
                {/* Dots indicators with layout spring animations */}
                <div className="flex items-center gap-1.5 h-3">
                  {steps.map((item, itemIndex) => {
                    const isActive = itemIndex === index;
                    return (
                      <motion.span
                        key={item.title}
                        layout
                        animate={{
                          width: isActive ? 24 : 6,
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className={cn(
                          "h-1.5 rounded-full transition-colors duration-300",
                          isActive ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Button data-tour-control="true" size="sm" variant="ghost" className="text-xs" onClick={closeTour}>
                    {t("skip")}
                  </Button>
                  <Button
                    data-tour-control="true"
                    size="sm"
                    className="text-xs px-3 shadow-sm"
                    onClick={() => (index === steps.length - 1 ? closeTour() : setIndex(index + 1))}
                  >
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
