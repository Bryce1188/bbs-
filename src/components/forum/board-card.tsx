"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BoardIcon } from "@/components/forum/board-icon";
import type { Board } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function BoardCard({ board }: { board: Board }) {
  return (
    <Link href={`/boards/${board.slug}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -5, scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="h-full"
      >
        <Card className="glass-panel h-full overflow-hidden transition-colors duration-300 hover:border-primary/40 hover:shadow-[0_12px_30px_rgba(99,102,241,0.06)] dark:hover:shadow-[0_12px_30px_rgba(99,102,241,0.1)]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <BoardIcon name={board.icon} className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">{board.name}</h3>
                <Badge variant="outline">{board.group}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{board.description}</p>
            </div>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">主题 {formatNumber(board.postCount)}</span>
              <span className="font-medium text-primary">今日 +{board.todayCount}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
