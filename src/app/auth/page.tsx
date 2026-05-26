import Link from "next/link";
import { LogIn, UserRoundPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { signInAction, signUpAction } from "@/app/actions";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; created?: string; reset?: string }> }) {
  const { next, error, created, reset } = await searchParams;

  return (
    <section className="section-shell grid min-h-[calc(100svh-4rem)] items-center">
      <Card className="glass-panel mx-auto w-full max-w-md">
        <CardContent className="p-6">
          <Badge variant="outline">Supabase Auth</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal">登录或注册</h1>
          {created ? <p className="mt-3 rounded-md bg-muted/70 p-3 text-sm text-muted-foreground">账号已创建并完成邮箱确认，可以直接登录。</p> : null}
          {reset ? <p className="mt-3 rounded-md bg-muted/70 p-3 text-sm text-muted-foreground">密码已更新，请使用新密码登录。</p> : null}
          {error ? <p className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">登录状态需要重新确认：{error}</p> : null}
          <form action={signInAction} className="mt-6 grid gap-3">
            <input type="hidden" name="next" value={next ?? "/"} />
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="account">
              邮箱
              <Input id="account" name="account" type="email" autoComplete="email" placeholder="name@example.com" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="password">
              密码
              <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="密码" />
            </label>
            <div className="flex items-center justify-between gap-3">
              <Link href="/auth/reset" className="text-sm text-muted-foreground transition hover:text-foreground">
                忘记密码？
              </Link>
              <SubmitButton pendingText="登录中…">
                <LogIn className="h-4 w-4" />
                登录
              </SubmitButton>
            </div>
            <div className="mt-2 rounded-md border bg-muted/35 p-3">
              <p className="text-sm font-medium">还没有账号？</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">使用上面的邮箱和密码创建普通账号，创建后可直接登录。</p>
              <SubmitButton formAction={signUpAction} variant="glass" className="mt-3 w-full" pendingText="创建中…">
                <UserRoundPlus className="h-4 w-4" />
                创建账号
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
