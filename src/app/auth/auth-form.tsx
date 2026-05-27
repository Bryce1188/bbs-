"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { KeyRound, Lock, LogIn, Mail, Send, UserRoundPlus } from "lucide-react";
import { sendVerificationCodeAction, signInAction, signUpAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";

type TabType = "signin" | "signup";

interface AuthFormProps {
  next: string;
  error?: string;
  errorMessage: string | null;
  created?: boolean;
  reset?: boolean;
  verificationSent?: boolean;
  initialTab?: TabType;
  initialAccount?: string;
}

export function AuthForm({
  next,
  error,
  errorMessage,
  created,
  reset,
  verificationSent,
  initialTab = "signin",
  initialAccount = ""
}: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (
      initialTab === "signup" ||
      (error &&
        [
          "weak_password",
          "user_already_exists",
          "sign_up_failed",
          "verification_send_failed",
          "verification_too_frequent",
          "verification_invalid",
          "verification_expired",
          "verification_failed",
          "verification_attempts_exceeded",
          "supabase_service_not_configured"
        ].includes(error))
    ) {
      return "signup";
    }
    return "signin";
  });

  const [localError, setLocalError] = useState<string | null>(errorMessage);
  const [showCreated, setShowCreated] = useState<boolean>(!!created);
  const [showReset, setShowReset] = useState<boolean>(!!reset);
  const [showSent, setShowSent] = useState<boolean>(!!verificationSent);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setLocalError(null);
    setShowCreated(false);
    setShowReset(false);
    setShowSent(false);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {showCreated && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-md bg-muted/70 p-3 text-sm text-muted-foreground"
          >
            账号已创建，请使用邮箱和密码登录。
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
        {showSent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-md bg-primary/10 p-3 text-sm text-primary"
          >
            验证码已发送，5 分钟内有效。本地开发未配置邮件服务时，请在运行终端查看验证码。
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

      <div className="relative flex rounded-lg bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => handleTabChange("signin")}
          className={cn(
            "relative z-10 w-full rounded-md py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none",
            activeTab === "signin" ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {activeTab === "signin" && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 rounded-md border border-border/20 bg-background shadow-sm"
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
            activeTab === "signup" ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {activeTab === "signup" && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 rounded-md border border-border/20 bg-background shadow-sm"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-20 flex items-center justify-center gap-1.5">
            <UserRoundPlus className="h-3.5 w-3.5" />
            注册账号
          </span>
        </button>
      </div>

      <div className="relative min-h-[300px] overflow-hidden transition-all duration-300">
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
                  <label className="flex items-center gap-1.5 text-sm font-medium" htmlFor="signin-account">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    邮箱
                  </label>
                  <Input id="signin-account" name="account" type="email" autoComplete="email" placeholder="name@example.com" required />
                </div>
                <div className="grid gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium" htmlFor="signin-password">
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
                <div className="mt-2 flex items-center justify-between gap-3">
                  <Link href="/auth/reset" className="text-sm text-muted-foreground transition hover:text-foreground">
                    忘记密码？
                  </Link>
                  <SubmitButton pendingText="登录中...">
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
                  <label className="flex items-center gap-1.5 text-sm font-medium" htmlFor="signup-account">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    邮箱
                  </label>
                  <Input
                    id="signup-account"
                    name="account"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    defaultValue={initialAccount}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium" htmlFor="signup-password">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    密码
                  </label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="密码不少于 6 位"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium" htmlFor="signup-code">
                    <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                    邮箱验证码
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="signup-code"
                      name="code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="6 位数字"
                    />
                    <SubmitButton
                      type="submit"
                      variant="secondary"
                      pendingText="发送中..."
                      formAction={sendVerificationCodeAction}
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                      发送验证码
                    </SubmitButton>
                  </div>
                </div>
                <p className="text-xs leading-normal text-muted-foreground">
                  验证码 5 分钟内有效。同一邮箱 60 秒内只能发送一次；本地未配置邮件服务时，验证码会打印在运行终端。
                </p>
                <SubmitButton variant="glass" className="mt-1 w-full" pendingText="创建中...">
                  <UserRoundPlus className="h-4 w-4" />
                  验证并创建账号
                </SubmitButton>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
