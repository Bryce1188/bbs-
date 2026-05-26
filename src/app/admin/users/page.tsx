import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { assignUserRoleAction } from "@/app/actions";
import { getAdminProfiles } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const profiles = await getAdminProfiles();
  const keyword = (q ?? "").trim().toLowerCase();
  const filteredProfiles = keyword
    ? profiles.filter((profile) =>
        [profile.username, profile.displayName, profile.role, profile.level, profile.signature].join(" ").toLowerCase().includes(keyword)
      )
    : profiles;

  return (
    <section className="section-shell">
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_320px] md:items-end">
        <div>
          <Badge variant="teal">用户管理</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">用户、状态与角色</h1>
        </div>
        <form action="/admin/users" className="flex gap-2">
          <Input aria-label="搜索用户名或角色" name="q" defaultValue={q ?? ""} placeholder="搜索用户名或角色" />
          <Button type="submit" variant="secondary">搜索</Button>
        </form>
      </div>
      <Card className="glass-panel overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full text-sm">
            <thead className="bg-muted/70 text-left">
              <tr>
                <th className="p-4">用户</th>
                <th className="p-4">角色</th>
                <th className="p-4">等级</th>
                <th className="p-4">注册时间</th>
                <th className="p-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="border-t">
                  <td className="p-4 font-medium">{profile.displayName}</td>
                  <td className="p-4"><Badge variant="outline">{profile.role}</Badge></td>
                  <td className="p-4 text-muted-foreground">{profile.level}</td>
                  <td className="p-4 text-muted-foreground">{formatDate(profile.joinedAt)}</td>
                  <td className="p-4">
                    <form action={assignUserRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={profile.id} />
                      <select name="role" defaultValue={profile.role} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                        <option value="member">member</option>
                        <option value="moderator">moderator</option>
                        <option value="admin">admin</option>
                      </select>
                      <Button type="submit" size="sm" variant="secondary">保存</Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
