import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AuthForm } from "@/app/auth/auth-form";

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createCaptcha() {
  return Array.from({ length: 5 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join("");
}

const errorMessages: Record<string, string> = {
  invalid_credentials: "邮箱或密码错误，请确认后重新登录。",
  weak_password: "密码安全级别低：长度不能少于 6 位。",
  invalid_email: "邮箱格式不正确：请输入有效的电子邮箱地址。",
  user_already_exists: "该邮箱已被注册：请直接登录，或通过忘记密码找回。",
  sign_up_failed: "注册失败：数据库可能暂时不可用，请稍后再试。",
  supabase_not_configured: "数据库服务未配置，请先配置 Supabase。"
};

type AuthSearchParams = {
  next?: string;
  error?: string;
  created?: string;
  reset?: string;
  tab?: string;
};

export default async function AuthPage({ searchParams }: { searchParams: Promise<AuthSearchParams> }) {
  const { next, error, created, reset, tab } = await searchParams;
  const errorMessage = error ? (errorMessages[error] || `系统提示：${error}`) : null;
  const initialCaptcha = createCaptcha();

  return (
    <section className="section-shell grid min-h-[calc(100svh-4rem)] items-center">
      <Card className="glass-panel mx-auto w-full max-w-md">
        <CardContent className="p-6">
          <Badge variant="outline">Supabase Auth</Badge>
          <h1 className="mt-3 mb-4 text-2xl font-semibold tracking-normal">登录或注册</h1>

          <AuthForm
            next={next ?? "/"}
            error={error}
            errorMessage={errorMessage}
            created={created === "1"}
            reset={reset === "1"}
            initialTab={tab === "signup" ? "signup" : "signin"}
            initialCaptcha={initialCaptcha}
          />
        </CardContent>
      </Card>
    </section>
  );
}
