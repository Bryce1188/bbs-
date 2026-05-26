"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { type ReactNode } from "react";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.992, filter: "blur(10px)" }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 1.008, filter: "blur(8px)" }}
        transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
