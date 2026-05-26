"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, UserRoundPlus, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { signInAction, signUpAction } from "@/app/actions";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  next: string;
  error?: string;
  errorMessage: string | null;
  created?: boolean;
  reset?: boolean;
}

export function AuthForm({ next, error, errorMessage, created, reset }: AuthFormProps) {
  type TabType = "signin" | "signup";

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (error && ["weak_password", "user_already_exists", "sign_up_failed"].includes(error)) {
      return "signup";
    }
    return "signin";
  });

  const [localError, setLocalError] = useState<string | null>(errorMessage);
  const [showCreated, setShowCreated] = useState<boolean>(!!created);
  const [showReset, setShowReset] = useState<boolean>(!!reset);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Clear alerts when switching tabs to keep the UI clean
    setLocalError(null);
    setShowCreated(false);
    setShowReset(false);
  };

  return (
    <div className="space-y-4">
      {/* Alert Messages */}
      <AnimatePresence mode="popLayout">
        {showCreated && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-md bg-muted/70 p-3 text-sm text-muted-foreground"
          >
            账号已创建并完成邮箱确认，可以直接登录。
          </motion.div>
        )}
        {showReset && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-md bg-muted/70 p-3 text-sm text-muted-foreground"
          >
            密码已更新，请使用新密码登录。
          </motion.div>
        )}
        {localError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          >
            {localError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Trigger */}
      <div className="relative flex rounded-lg bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => handleTabChange("signin")}
          className={cn(
            "relative z-10 w-full rounded-md py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none",
            activeTab === "signin" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {activeTab === "signin" && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 rounded-md bg-background shadow-sm border border-border/20"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-20 flex items-center justify-center gap-1.5">
            <LogIn className="h-3.5 w-3.5" />
            账号登录
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("signup")}
          className={cn(
            "relative z-10 w-full rounded-md py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none",
            activeTab === "signup" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {activeTab === "signup" && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 rounded-md bg-background shadow-sm border border-border/20"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-20 flex items-center justify-center gap-1.5">
            <UserRoundPlus className="h-3.5 w-3.5" />
            注册账号
          </span>
        </button>
      </div>

      {/* Tabs Content */}
      <div className="relative overflow-hidden min-h-[220px] transition-all duration-300">
        <AnimatePresence mode="wait">
          {activeTab === "signin" ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <form action={signInAction} className="grid gap-3">
                <input type="hidden" name="next" value={next} />
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5" htmlFor="signin-account">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    邮箱
                  </label>
                  <Input
                    id="signin-account"
                    name="account"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5" htmlFor="signin-password">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    密码
                  </label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="请输入密码"
                    required
                  />
                </div>
                <div className="flex items-center justify-between gap-3 mt-2">
                  <Link href="/auth/reset" className="text-sm text-muted-foreground transition hover:text-foreground">
                    忘记密码？
                  </Link>
                  <SubmitButton pendingText="登录中…">
                    <LogIn className="h-4 w-4" />
                    登录
                  </SubmitButton>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <form action={signUpAction} className="grid gap-3">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5" htmlFor="signup-account">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    邮箱
                  </label>
                  <Input
                    id="signup-account"
                    name="account"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5" htmlFor="signup-password">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    密码
                  </label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="密码（不少于 6 位）"
                    required
                  />
                </div>
                <p className="text-xs leading-normal text-muted-foreground mt-1">
                  提示：注册成功后，您将可以使用该账号直接登录本社区。
                </p>
                <SubmitButton variant="glass" className="mt-2 w-full" pendingText="创建中…">
                  <UserRoundPlus className="h-4 w-4" />
                  创建账号
                </SubmitButton>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
