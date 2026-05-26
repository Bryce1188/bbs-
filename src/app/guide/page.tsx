import { BadgeCheck, Database, MousePointerClick, Palette, Rocket, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { icon: MousePointerClick, title: "浏览社区", text: "从首页查看热度、进入板块、打开帖子详情并参与回复。" },
  { icon: Palette, title: "切换主题与语言", text: "右上角提供深浅主题和中文/英文切换，默认中文。" },
  { icon: Database, title: "连接 Supabase", text: "配置 `.env.local` 后，数据读取会优先走 Supabase，未配置时使用演示数据。" },
  { icon: ShieldCheck, title: "后台管理", text: "后台入口覆盖用户、角色、板块、帖子、评论、举报、公告和日志。" },
  { icon: BadgeCheck, title: "课程验收", text: "`legacy-java-mvc` 分支保留 Tomcat/MySQL/MVC 版本，主分支用于 Vercel 展示。" },
  { icon: Rocket, title: "远程部署", text: "完成环境变量后运行 Vercel 部署，Storage 和 Realtime 由 Supabase 承担。" }
];

export default function GuidePage() {
  return (
    <section className="section-shell">
      <div className="mb-6">
        <Badge variant="teal">用户指导</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Motion 引导与功能路径</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          页面右下角的浮层使用 Motion for React 实现。这里保留完整指导，方便答辩或部署说明。
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="glass-panel">
              <CardContent className="p-5">
                <div className="rounded-md bg-primary/10 p-2 text-primary w-fit">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
