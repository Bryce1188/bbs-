"use client";

import { useRef } from "react";
import { KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";

type LocalResetPasswordFormProps = {
  account: string;
  code: string;
};

export function LocalResetPasswordForm({ account, code }: LocalResetPasswordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action="/auth/reset/submit" method="post" className="mt-6 grid gap-3 border-t pt-5">
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="update-account">
        注册邮箱
        <Input id="update-account" name="account" type="email" defaultValue={account} readOnly placeholder="name@example.com" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="reset-code">
        验证码
        <Input id="reset-code" name="code" defaultValue={code} readOnly placeholder="6 位验证码" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="new-password">
        设置新密码
        <Input id="new-password" name="secretA" type="password" placeholder="至少 6 位" autoComplete="new-password" required minLength={6} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="confirm-password">
        再次确认密码
        <Input id="confirm-password" name="secretB" type="password" placeholder="再次输入新密码" autoComplete="new-password" required minLength={6} />
      </label>
      <button
        type="button"
        disabled={!account || !code}
        onClick={() => formRef.current?.requestSubmit()}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        <KeyRound className="h-4 w-4" />
        更新密码
      </button>
    </form>
  );
}
