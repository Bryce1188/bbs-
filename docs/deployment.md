# 部署说明

## 本地 CLI

- 已检测到：`node`、`npm`、`bun`、`vercel`、`java`、`mvn`、`mysql`。
- 项目使用本地 devDependency 里的 Supabase CLI，可直接运行 `npx supabase ...`。
- 常用 CLI：
  - `npx supabase ...`：本地数据库、迁移、类型生成。
  - `vercel ...`：预览和生产部署。
  - `npx shadcn@latest ...`：后续补充 shadcn/ui 组件时使用。

## Supabase

```bash
npm install
npx supabase init
npx supabase start
npx supabase db reset
```

将本地输出的 URL 和 publishable key 写入 `.env.local`。

生成数据库类型：

```bash
npm run supabase:types
```

远程生产库迁移：

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase db seed --file supabase/seed.sql
npm run supabase:types
```

Auth 配置：

- Site URL：Vercel 生产域名。
- Redirect URLs：至少加入 `http://localhost:3000/auth`、`http://localhost:3000/auth/callback`、`http://localhost:3000/auth/reset`，生产环境加入对应的 `https://<your-domain>/auth`、`https://<your-domain>/auth/callback`、`https://<your-domain>/auth/reset`。
- 新用户会通过 `handle_new_user` trigger 自动写入 `public.profiles`。
- 首次管理员初始化：

```sql
select public.bootstrap_admin_by_email('your-admin@example.com');
```

执行前需要先用该邮箱完成一次注册。迁移会撤销该函数对 `anon`、`authenticated` 的执行权限，只保留 `service_role`，请在 Supabase SQL Editor 或受控维护脚本中执行。

Storage 配置：

- 迁移会创建 `avatars` 和 `post-images` bucket。
- `storage.objects` 已配置公开读取和认证用户上传策略。
- 公开 bucket 不允许头像 SVG 上传；如后续需要 SVG，先做服务端净化或转码。

安全头：

- `next.config.mjs` 已配置 CSP、HSTS、Frame deny、nosniff、Referrer Policy、Permissions Policy 和 CORP。
- 生产环境 CSP 不启用 `unsafe-eval`；开发环境保留它以兼容 Next/Turbopack 调试。

## Vercel

1. 在 Vercel 新建项目，Root Directory 选择仓库根目录。
2. Build Command 使用 `npm run build`。
3. 配置 `.env.example` 中列出的环境变量。
4. 确认生产 Supabase 已执行 `db push` 与 `seed`。
5. 部署：

```bash
vercel deploy --prod
```

部署后检查：

```bash
npm run test
npm audit --audit-level=moderate
vercel env ls
```

生产发布检查：

- Vercel Production/Preview 环境变量分开配置。
- 生产环境保持 `ADMIN_DEMO_MODE=false`；仅本地演示后台 mock UI 时设置为 `true`。
- Supabase 生产库已执行 `db push` 和 `seed`。
- 管理员邮箱已执行 `bootstrap_admin_by_email`。
- `/admin` 未登录时应跳转到 `/auth`。
- `npm audit --audit-level=moderate` 为 0 vulnerabilities。
- 私信和通知页在 Supabase Realtime/Postgres Changes 可用时应能自动刷新。
- 如数据库迁移失败，先回滚 Supabase migration，再回滚 Vercel deployment。

管理员入口：

- `/admin` 要求 Supabase 已配置、用户已登录，且 `profiles.role` 为 `admin` 或 `moderator`。
- 未配置 Supabase 时，只有 `ADMIN_DEMO_MODE=true` 会展示 mock 后台；所有写操作仍需要真实 Supabase。

## 课程版说明

`legacy-java-mvc` 分支和 `legacy-java-mvc-snapshot` 标签保留原 Spring MVC + MyBatis + Shiro + MySQL + Tomcat 代码，用于满足 Tomcat 6+、MySQL 5.5+、MVC 结构的课程验收口径。
