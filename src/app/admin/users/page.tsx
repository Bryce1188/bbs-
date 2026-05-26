import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageAlert } from "@/components/ui/page-alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { assignUserRoleAction } from "@/app/actions";
import { getAdminProfiles } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const ERROR_TEXT: Record<string, string> = {
  invalid_role: "角色参数校验失败，请检查后重试。",
  role_failed: "角色更新失败，请稍后重试。"
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; error?: string }> }) {
  const { q, error } = await searchParams;
  const profiles = await getAdminProfiles();
  const keyword = (q ?? "").trim().toLowerCase();
  const filteredProfiles = keyword
    ? profiles.filter((profile) =>
        [profile.username, profile.displayName, profile.role, profile.level, profile.signature].join(" ").toLowerCase().includes(keyword)
      )
    : profiles;

  return (
    <section className="section-shell">
      {error && ERROR_TEXT[error] ? <PageAlert tone="error" message={ERROR_TEXT[error]} /> : null}
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_320px] md:items-end">
        <div>
          <Badge variant="outline">用户管理</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">用户、状态与角色</h1>
        </div>
        <form action="/admin/users" className="flex gap-2">
          <Input aria-label="搜索用户名或角色" name="q" defaultValue={q ?? ""} placeholder="搜索用户名或角色" />
          <SubmitButton variant="secondary" pendingText="搜索中…">搜索</SubmitButton>
        </form>
      </div>
      <Card className="glass-panel overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[680px]">
              <TableHeader className="bg-muted/70">
                <TableRow className="hover:bg-transparent">
                  <TableHead>用户</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>等级</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.displayName}</TableCell>
                  <TableCell><Badge variant="outline">{profile.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{profile.level}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(profile.joinedAt)}</TableCell>
                  <TableCell>
                    <form action={assignUserRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={profile.id} />
                      <Select name="role" defaultValue={profile.role}>
                        <SelectTrigger className="h-9 w-36" aria-label="用户角色">
                          <SelectValue placeholder="选择角色" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">member</SelectItem>
                          <SelectItem value="moderator">moderator</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <SubmitButton size="sm" variant="secondary" pendingText="保存中…">保存</SubmitButton>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
