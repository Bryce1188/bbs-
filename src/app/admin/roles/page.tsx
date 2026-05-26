import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createRoleAction, deleteRoleAction, updateRoleAction } from "@/app/actions";
import { getRoles } from "@/lib/data";

export default async function AdminRolesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const roles = await getRoles();

  return (
    <section className="section-shell">
      <Badge variant="teal">角色权限</Badge>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal">RBAC 权限设计</h1>
      {error ? <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">角色操作失败：{error}</p> : null}
      <Card className="glass-panel mt-6">
        <CardContent className="p-5">
          <form action={createRoleAction} className="grid gap-3 md:grid-cols-[160px_180px_1fr_auto] md:items-end">
            <label className="grid gap-1.5 text-sm font-medium">
              Code
              <Input name="code" placeholder="editor" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              名称
              <Input name="name" placeholder="内容编辑" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              描述
              <Input name="description" placeholder="角色说明" />
            </label>
            <Button type="submit">新增角色</Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.code} className="glass-panel">
            <CardContent className="p-5">
              <Badge variant="outline">{role.code}</Badge>
              <form action={updateRoleAction} className="mt-4 grid gap-3">
                <input type="hidden" name="roleId" value={role.id} />
                <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                  Code
                  <Input name="code" defaultValue={role.code} />
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                  名称
                  <Input name="name" defaultValue={role.name} />
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                  描述
                  <Textarea name="description" defaultValue={role.description} className="min-h-20" />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" size="sm" variant="secondary">保存</Button>
                  <Button type="submit" size="sm" variant="destructive" formAction={deleteRoleAction}>删除</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
