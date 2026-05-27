"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lock, LogIn, Mail, RefreshCw, ShieldCheck, UserRoundPlus } from "lucide-react";
import { signInAction, signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
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
  initialTab?: TabType;
  initialCaptcha: string;
}

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createCaptcha() {
  return Array.from({ length: 5 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join("");
}

function captchaNoise(seed: string) {
  return Array.from({ length: 18 }, (_, index) => {
    const code = seed.charCodeAt(index % seed.length) || 41;
    return {
      left: (code * (index + 7)) % 100,
      top: (code * (index + 13)) % 100,
      size: 1 + ((code + index) % 3),
      opacity: 0.12 + ((code + index) % 5) * 0.04
    };
  });
}

export function AuthForm({ next, error, errorMessage, created, reset, initialTab = "signin", initialCaptcha }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (initialTab === "signup" || (error && ["weak_password", "user_already_exists", "sign_up_failed"].includes(error))) {
      return "signup";
    }
    return "signin";
  });

  const [localError, setLocalError] = useState<string | null>(errorMessage);
  const [showCreated, setShowCreated] = useState<boolean>(!!created);
  const [showReset, setShowReset] = useState<boolean>(!!reset);
  const [captcha, setCaptcha] = useState(initialCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaTouched, setCaptchaTouched] = useState(false);

  const isCaptchaValid = useMemo(() => captchaInput.trim().toUpperCase() === captcha, [captcha, captchaInput]);
  const noise = useMemo(() => captchaNoise(captcha), [captcha]);

  const refreshCaptcha = () => {
    setCaptcha(createCaptcha());
    setCaptchaInput("");
    setCaptchaTouched(false);
    setLocalError(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setLocalError(null);
    setShowCreated(false);
    setShowReset(false);
    if (tab === "signup") {
      refreshCaptcha();
    }
  };

  const handleSignupSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setCaptchaTouched(true);
    if (!isCaptchaValid) {
      event.preventDefault();
      setLocalError("人机验证码错误，请看清图案后重新输入。");
    }
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
              <form action={signUpAction} onSubmit={handleSignupSubmit} className="grid gap-3">
                <div className="grid gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium" htmlFor="signup-account">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    邮箱
                  </label>
                  <Input id="signup-account" name="account" type="email" autoComplete="email" placeholder="name@example.com" required />
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
                  <label className="flex items-center gap-1.5 text-sm font-medium" htmlFor="signup-captcha">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                    人机验证码
                  </label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_150px]">
                    <Input
                      id="signup-captcha"
                      value={captchaInput}
                      onChange={(event) => {
                        setCaptchaInput(event.target.value);
                        setCaptchaTouched(true);
                        if (localError?.includes("人机验证码")) setLocalError(null);
                      }}
                      autoComplete="off"
                      placeholder="输入右侧图案"
                      aria-invalid={captchaTouched && !isCaptchaValid}
                      required
                    />
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      title="点击刷新验证码"
                      className="relative h-12 overflow-hidden rounded-md border border-border/70 bg-[linear-gradient(135deg,hsl(var(--muted))_0%,hsl(var(--background))_52%,hsl(var(--muted))_100%)] px-3 font-mono text-lg font-bold text-foreground shadow-inner transition hover:bg-muted"
                    >
                      <span className="absolute inset-x-0 top-1/2 h-px rotate-[-10deg] bg-primary/45 blur-[0.4px]" />
                      <span className="absolute inset-x-1 top-1/3 h-px rotate-[12deg] bg-foreground/25 blur-[0.6px]" />
                      <span className="absolute inset-x-2 bottom-3 h-px rotate-[5deg] bg-foreground/20 blur-[0.5px]" />
                      {noise.map((dot, index) => (
                        <span
                          key={`${captcha}-${index}`}
                          className="absolute rounded-full bg-foreground blur-[0.2px]"
                          style={{
                            left: `${dot.left}%`,
                            top: `${dot.top}%`,
                            width: dot.size,
                            height: dot.size,
                            opacity: dot.opacity
                          }}
                        />
                      ))}
                      <span className="relative flex select-none items-center justify-center gap-0.5 blur-[0.35px]">
                        {(captcha || "-----").split("").map((char, index) => (
                          <span
                            key={`${char}-${index}`}
                            className="inline-block"
                            style={{
                              transform: `translateY(${index % 2 === 0 ? "-1px" : "2px"}) rotate(${[-8, 5, -3, 8, -6][index] ?? 0}deg)`,
                              letterSpacing: "0.16em",
                              opacity: 0.84 + index * 0.02
                            }}
                          >
                            {char}
                          </span>
                        ))}
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>大小写都可以，点击图案可刷新。</span>
                    <Button type="button" variant="ghost" size="sm" onClick={refreshCaptcha} className="h-7 gap-1 px-2 text-xs">
                      <RefreshCw className="h-3.5 w-3.5" />
                      换一张
                    </Button>
                  </div>
                </div>
                <SubmitButton variant="glass" className="mt-1 w-full" pendingText="创建中..." disabled={!captcha || !isCaptchaValid}>
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
