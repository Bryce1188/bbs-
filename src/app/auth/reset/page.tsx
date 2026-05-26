import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { LocalResetPasswordForm } from "@/components/auth/local-reset-password-form";
import { requestPasswordResetAction } from "@/app/actions";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string; error?: string; code?: string; account?: string }>;
}) {
  const { sent, error, code, account } = await searchParams;

  return (
    <section className="section-shell grid min-h-[calc(100svh-4rem)] items-center">
      <Card className="glass-panel mx-auto w-full max-w-md">
        <CardContent className="p-6">
          <Badge variant="outline">账号恢复</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal">找回密码</h1>
          {sent ? <p className="mt-3 rounded-md bg-muted/70 p-3 text-sm text-muted-foreground">本地验证码已生成：<span className="font-semibold text-foreground">{code}</span></p> : null}
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

          <LocalResetPasswordForm account={account ?? ""} code={code ?? ""} />

          <Button asChild variant="ghost" className="mt-4 w-full">
            <Link href="/auth">返回登录</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
