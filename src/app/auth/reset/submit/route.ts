import { NextResponse } from "next/server";
import { updatePasswordWithCodeLocal } from "@/lib/local-db";

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let getValue: (key: string) => string;

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(await request.text());
    getValue = (key) => text(params.get(key));
  } else {
    const formData = await request.formData();
    getValue = (key) => text(formData.get(key));
  }

  const account = getValue("account");
  const code = getValue("code");
  const password = getValue("secretA") || getValue("nextPassword") || getValue("password");
  const confirmPassword = getValue("secretB") || getValue("nextConfirmPassword") || getValue("confirmPassword");

  if (!account || !code || password.length < 6 || confirmPassword.length < 6 || password !== confirmPassword) {
    return NextResponse.redirect(new URL("/auth/reset?error=password_mismatch", request.url), 303);
  }

  const ok = await updatePasswordWithCodeLocal(account, code, password);
  if (!ok) {
    return NextResponse.redirect(new URL("/auth/reset?error=invalid_code", request.url), 303);
  }

  return NextResponse.redirect(new URL("/auth?reset=1", request.url), 303);
}
