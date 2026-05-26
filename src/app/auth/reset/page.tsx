import Link from "next/link";
import { KeyRound, MailCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { requestPasswordResetAction, updatePasswordAction } from "@/app/actions";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <section className="section-shell grid min-h-[calc(100svh-4rem)] items-center">
      <Card className="glass-panel mx-auto w-full max-w-md">
        <CardContent className="p-6">
          <Badge variant="outline">账号恢复</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal">找回密码</h1>
          {sent ? <p className="mt-3 rounded-md bg-muted/70 p-3 text-sm text-muted-foreground">重置邮件已发送，请从邮箱打开链接后设置新密码。</p> : null}
          {error ? <p className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">操作失败：{error}</p> : null}

          <form action={requestPasswordResetAction} className="mt-6 grid gap-3">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="reset-account">
              注册邮箱
              <Input id="reset-account" name="account" type="email" autoComplete="email" placeholder="name@example.com" />
            </label>
            <SubmitButton variant="secondary" pendingText="发送中…">
              <MailCheck className="h-4 w-4" />
              发送重置邮件
            </SubmitButton>
          </form>

          <form action={updatePasswordAction} className="mt-6 grid gap-3 border-t pt-5">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="new-password">
              新密码
              <Input id="new-password" name="password" type="password" autoComplete="new-password" placeholder="至少 6 位" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="confirm-password">
              确认新密码
              <Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="再次输入新密码" />
            </label>
            <SubmitButton pendingText="更新中…">
              <KeyRound className="h-4 w-4" />
              更新密码
            </SubmitButton>
          </form>

          <Button asChild variant="ghost" className="mt-4 w-full">
            <Link href="/auth">返回登录</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
