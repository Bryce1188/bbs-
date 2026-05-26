import Link from "next/link";
import { KeyRound, MailCheck, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { requestPasswordResetAction, updatePasswordAction } from "@/app/actions";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const errorMessages: Record<string, string> = {
  invalid_email: "邮箱格式不正确：请输入有效的电子邮箱地址。",
  reset_failed: "发送重置邮件失败：该邮箱可能未注册，或发送次数超限，请稍后再试。",
  password_mismatch: "密码更新失败：两次输入的密码不一致，或密码长度少于 6 位。",
  update_failed: "密码更新失败：会话可能已过期，请重新通过邮件链接进入。"
};

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  const errorMessage = error ? (errorMessages[error] || `操作失败：${error}`) : null;

  const supabase = await getSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  return (
    <section className="section-shell grid min-h-[calc(100svh-4rem)] items-center">
      <Card className="glass-panel mx-auto w-full max-w-md animate-fade-in">
        <CardContent className="p-6">
          <Badge variant="outline">账号恢复</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal">
            {user ? "设置新密码" : "找回密码"}
          </h1>
          {sent ? <p className="mt-3 rounded-md bg-muted/70 p-3 text-sm text-muted-foreground">重置邮件已发送，请从邮箱打开链接后设置新密码。</p> : null}
          {errorMessage ? <p className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</p> : null}

          {user ? (
            <form action={updatePasswordAction} className="mt-6 grid gap-3">
              <div className="text-xs text-muted-foreground bg-muted/35 p-3 rounded-md flex items-start gap-2 border">
                <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  正在为账户 <span className="font-semibold text-foreground">{user.email}</span> 设置新密码。
                </span>
              </div>
              <label className="grid gap-1.5 text-sm font-medium" htmlFor="new-password">
                新密码
                <Input id="new-password" name="password" type="password" autoComplete="new-password" placeholder="至少 6 位" required />
              </label>
              <label className="grid gap-1.5 text-sm font-medium" htmlFor="confirm-password">
                确认新密码
                <Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="再次输入新密码" required />
              </label>
              <SubmitButton pendingText="更新中…">
                <KeyRound className="h-4 w-4" />
                更新密码
              </SubmitButton>
            </form>
          ) : (
            <form action={requestPasswordResetAction} className="mt-6 grid gap-3">
              <label className="grid gap-1.5 text-sm font-medium" htmlFor="reset-account">
                注册邮箱
                <Input id="reset-account" name="account" type="email" autoComplete="email" placeholder="name@example.com" required />
              </label>
              <SubmitButton variant="secondary" pendingText="发送中…">
                <MailCheck className="h-4 w-4" />
                发送重置邮件
              </SubmitButton>
            </form>
          )}

          <Button asChild variant="ghost" className="mt-4 w-full">
            <Link href="/auth">返回登录</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

