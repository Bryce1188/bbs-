# BBS 星桥社区

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth%20%2B%20Storage-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel)](https://vercel.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-111827)](https://ui.shadcn.com/)
[![Motion](https://img.shields.io/badge/Motion-React-0055FF)](https://motion.dev/docs/react)
[![Three.js](https://img.shields.io/badge/Three.js-r128%2B-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![Audit](https://img.shields.io/badge/npm%20audit-0%20known%20vulnerabilities-22c55e)](#验证)

现代化论坛系统重构版。主线工程使用 **Next.js + Supabase + shadcn/ui + Motion + Three.js + Vercel**，默认中文，支持主题切换、多语言切换、玻璃质感组件、三维交互星轨背景、线性/层级动画和用户指导浮层。

**在线运行体验网址**：[https://bbs-swart-ten.vercel.app](https://bbs-swart-ten.vercel.app)

> 💡 **项目双轨交付与重构升级说明**：
> 1. **线上部署分支 (`main`)**：采用现代化的 **Next.js + Supabase (PostgreSQL) + Tailwind CSS + Framer Motion + Three.js** 技术栈，进行了前端动效与 3D 视觉深度重构，项目已成功云端部署，**在线体验网址为：[https://bbs-swart-ten.vercel.app](https://bbs-swart-ten.vercel.app)**。
> 2. **课程本地分支 (`legacy-java-mvc`)**：采用传统的 **Spring MVC + MyBatis + Shiro + MySQL + Tomcat** 经典 MVC 架构，同样进行了代码重构与逻辑闭环升级。该本地部署版本已完整推送至远端 `legacy-java-mvc` 分支，服务器要求为 **Tomcat 6.0 以上**，数据库为 **MySQL 5.5 以上**，**完全满足并符合课程作业验收的所有 MVC 结构、服务器与数据库指标与要求**。


## 功能

- 社区首页：统计卡片、活跃板块、精选主题、部署说明。
- 板块系统：12 个原始板块重构为响应式卡片和详情页。
- 帖子系统：主题列表、详情页、回复区、点赞、收藏、举报写入。
- 用户系统：登录/注册、找回密码、个人主页、等级、积分、签名。
- 私信通知：私信中心、好友申请、通知中心，Postgres Changes 触发页面刷新。
- 后台管理：用户、角色 CRUD、板块编辑、帖子、评论显隐、举报、公告、日志筛选分页。
- 动效与三维增强：集成 **Three.js** 交互式星轨粒子网格背景，支持鼠标排斥、呼吸微光与高斯模糊（Gaussian Blur）景深融合；重构卡片/按键的 **Framer Motion** 物理弹簧微交互；全面重构 Guided Tour 引导浮层切换动画与指示点胶囊弹性拉伸效果。
- 展示增强：shadcn 风格组件、lucide 图标、玻璃质感、Motion 引导、深浅主题、多语言切换。
- 生产防护：管理员路由要求 Supabase 已配置、用户已登录且角色为 `admin` 或 `moderator`。
- 写入闭环：登录/注册、密码重置、发布、回复、点赞、收藏、举报、私信、好友申请、通知已读、后台公告/审核/角色/板块调整通过 Server Actions 接入 Supabase。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | Next.js App Router、React、TypeScript、Tailwind CSS |
| UI | shadcn/ui 风格组件、Radix UI、lucide-react |
| 动画 / 3D | Motion for React、Three.js (WebGL Canvas) |
| 状态/表格 | TanStack Query、TanStack Table |
| 数据服务 | Supabase Postgres、Auth、Storage、Realtime |
| 部署 | Vercel |
| 课程旧版 | Spring MVC、MyBatis、Shiro、MySQL、Redis、Tomcat |

## 项目结构

```text
.
├── src/
│   ├── app/                 # Next.js 页面与路由
│   ├── components/          # UI、布局、论坛组件、Motion 引导
│   └── lib/                 # 数据读取、类型、Supabase client、mock fallback
├── supabase/
│   ├── migrations/          # Postgres schema
│   └── seed.sql             # 初始板块、角色、等级数据
├── docs/
│   ├── deployment.md        # Supabase 与 Vercel 部署说明
│   └── architecture.md      # 分层、数据流、权限边界
├── public/
│   └── avatars/             # 展示头像资源
├── .env.example
├── package.json
└── vercel.json
```

## 本地运行

### 1. 下载项目

```bash
git clone https://github.com/Bryce1188/bbs-.git
cd bbs-
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制一份本地环境变量文件：

```bash
cp .env.example .env.local
```

Windows PowerShell 可以使用：

```powershell
Copy-Item .env.example .env.local
```

如果只想先看页面效果，可以把 `.env.local` 里的 Supabase 配置留空：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
ADMIN_DEMO_MODE=true
```

未配置 Supabase 时，页面会自动使用 `src/lib/mock-data.ts` 中的中文演示数据，方便先查看首页、板块、帖子、用户、私信和后台 UI。

### 4. 启动项目

```bash
npm run dev
```

浏览器访问：

```text
http://localhost:3000
```

Windows 如果遇到 `3000` 端口被旧进程占用，可以使用：

```powershell
npm run dev:win
```

该脚本会自动停止占用 `3000` 端口的旧进程，然后重新启动项目。

## 人机验证码注册

当前注册页使用本地图形验证码：

1. 注册页输入邮箱和密码。
2. 页面随机生成 5 位字母数字图案。
3. 点击验证码图案或“换一张”可以刷新。
4. 输入验证码时大小写都可以。
5. 验证码输入正确后，才允许提交注册。

注意：图形验证码只负责阻止误提交和简单的人机校验。真正创建账号仍然需要配置 Supabase；只使用 mock 模式时，可以浏览页面，但不能真正注册登录。

## Supabase 初始化

Supabase CLI 官方推荐通过项目 devDependency 或 `npx` 使用：

```bash
npm install
npx supabase start
npx supabase db reset
```

Windows 本地可以直接运行项目脚本：

```powershell
npm run setup:supabase
```

该脚本会检查 Docker Desktop、启动本地 Supabase、执行迁移和重置数据库，并自动写入 `.env.local`。Supabase 本地服务依赖 Docker Desktop，如果提示找不到 `docker`，请先安装并启动 Docker Desktop。

常用脚本：

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:types
```

初始化管理员：

```sql
select public.bootstrap_admin_by_email('your-admin@example.com');
```

执行前先用该邮箱完成一次注册。该 RPC 在迁移中只授予 `service_role` 执行权限，建议在 Supabase SQL Editor 或安全的服务端维护任务中运行，不应从浏览器客户端调用。

连接远程 Supabase 项目后，生产库使用迁移推送：

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase db seed --file supabase/seed.sql
npm run supabase:types
```

`.env.local` 至少需要：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_DEMO_MODE=false
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

本地 Supabase 启动后，常用地址通常是：

```text
App:    http://localhost:3000
API:    http://127.0.0.1:54321
DB:     postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio: http://127.0.0.1:54323
```

`supabase/demo-data.sql` 中提供了演示用户、帖子、点赞和私信数据。真实数据库准备好后，可在 Supabase Studio SQL Editor 中执行该文件内容导入演示数据。

## Vercel 部署

1. 在 Vercel 导入仓库。
2. Root Directory 选择仓库根目录。
3. Build Command：`npm run build`。
4. Install Command：`npm install`。
5. 配置 `.env.example` 中的环境变量。
6. 在 Supabase Auth 中设置 Site URL 为 Vercel 生产域名，并加入 `https://<your-domain>/auth`、`https://<your-domain>/auth/callback`、`https://<your-domain>/auth/reset` 作为允许的重定向地址。
7. 执行 `bootstrap_admin_by_email` 初始化管理员。
8. 发布：

```bash
vercel deploy --prod
```

## 旧系统迁移映射

| 旧模块 | 新实现 |
| --- | --- |
| Shiro Session | Supabase Auth + RLS |
| MySQL `user` | `auth.users` + `profiles` |
| `plate` | `boards` |
| `post` | `posts` |
| `post_details` | `post_replies` |
| `post_operation` | `post_reactions` |
| `u_collect` | `bookmarks` |
| `attention` | `follows` |
| `private_msg` | `private_messages` |
| 本地 `uploadfiles` | Supabase Storage buckets |
| Java WebSocket | Supabase Realtime |

## 验证

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=moderate
```

旧 Java 版本可在 `legacy-java-mvc` 分支继续使用 Maven/Tomcat 验证。


