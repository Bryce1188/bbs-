import { Activity, Database, ShieldCheck, Users } from "lucide-react";
import { AdminMatrix } from "@/components/forum/admin-matrix";
import { StatCard } from "@/components/forum/stat-card";
import { Badge } from "@/components/ui/badge";
import { getHomeData } from "@/lib/data";

export default async function AdminPage() {
  const { stats } = await getHomeData();

  return (
    <section className="section-shell">
      <div className="mb-6">
        <Badge variant="teal">后台管理</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">管理控制台</h1>
        <p className="mt-2 text-sm text-muted-foreground">用 shadcn/ui 和 TanStack Table 方案替代旧 layui/layuimini 后台。</p>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="用户" value={stats.users} icon={Users} hint="profiles + roles" />
        <StatCard label="主题" value={stats.posts} icon={Activity} hint="posts + replies" />
        <StatCard label="在线" value={stats.online} icon={Database} hint="Realtime Presence" />
        <StatCard label="权限" value={4} icon={ShieldCheck} hint="RBAC + RLS" />
      </div>
      <AdminMatrix />
    </section>
  );
}
