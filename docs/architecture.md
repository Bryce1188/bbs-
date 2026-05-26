# 架构说明

## 系统分层

- 前端层：Next.js App Router，负责页面路由、Server Components、表单入口、主题/语言/动效体验。
- 交互层：Server Actions 负责登录、密码重置、发布、回复、点赞、收藏、举报、私信、好友申请、通知已读和后台管理动作。
- 数据层：`src/lib/data.ts` 统一读取 Supabase；未配置 Supabase 时仅公共展示页回退 mock 数据。
- 权限层：Supabase Auth + RLS；后台由 `requireAdminAccess()` 统一校验 `admin/moderator`。
- 存储层：Supabase Postgres 保存业务数据，Storage 保存头像和帖子图片；Realtime/Postgres Changes 用于私信和通知刷新。

## 本地课程版架构

当前分支新增一条不依赖远程 Supabase 的本地验收链路：

- 表现层：`src/app/messages/page.tsx` 和 `src/components/messages/local-websocket-chat.tsx` 负责私信 UI、在线状态和发送入口。
- 控制层：`server.mjs` 统一承接 HTTP 页面请求与 `/ws/messages` WebSocket 升级请求。
- 服务层：`local-server/relation-policy.mjs` 实现 L0-L5 用户关系等级、陌生人首条限制和低等级链接限制。
- DAO 层：`local-server/message-store.mjs` 读写 `.local-data/course-chat.json`，模拟本地数据库持久化。
- 实时层：`server.mjs` 使用 `ws` 维护在线连接、Presence 和点对点消息广播。

本地启动命令：

```bash
npm run dev:local
```

访问 `http://localhost:3000/messages?peer=miao` 后，页面会连接：

```text
ws://localhost:3000/ws/messages?userId=admin
```

为了兼容 legacy Java MVC 版本，本地网关同时接受：

```text
ws://localhost:3000/websocket/admin
```

旧消息格式 `{ "type": "1", "srcUser": { "userId": "admin" }, "tarUser": { "userId": "miao" }, "content": "...", "time": 1779775200000, "clientMsgId": "..." }` 会被转为统一消息模型后持久化和广播。

这条链路对应课程常见的 MVC/Service/DAO/WebSocket 分层口径；生产部署仍走 Supabase Auth、RLS 和 Realtime。

## 数据流

1. 页面 Server Component 调用数据层读取公开数据或当前用户数据。
2. 用户提交表单后进入 Server Action。
3. Server Action 用 Supabase session client 校验当前用户。
4. 写操作进入 Supabase RPC 或受 RLS 约束的表写入。
5. 成功后 `revalidatePath()` 刷新相关页面。
6. 私信和通知页订阅对应表的 Postgres Changes，收到变更后触发 `router.refresh()`。

本地课程版私信数据流：

1. 浏览器打开私信页，客户端组件建立 WebSocket 连接。
2. `server.mjs` 根据 `userId` 读取本地 JSON 消息并下发 `init`。
3. 浏览器发送 `send_message` 事件。
4. `relation-policy.mjs` 校验关系等级和内容限制。
5. `message-store.mjs` 写入 `.local-data/course-chat.json`。
6. WebSocket 网关向发送者和接收者推送新的消息事件。

## 权限边界

- 公开页面读取 `public_profiles` 视图，不直接暴露 `profiles.role`。
- 普通用户只能更新自己的公开资料字段。
- `role/points/level_name` 等敏感字段只能由管理员更新。
- `/admin/*` 在 Supabase 未配置时 fail-closed，不提供演示放行。
- `ADMIN_DEMO_MODE=true` 只用于本地展示 mock 后台 UI，不改变生产默认安全策略，写操作仍要求真实 Supabase。
- `bootstrap_admin_by_email` 只授予 `service_role` 执行权限，用于首次管理员初始化。
- 公开 Storage bucket 不接受头像 SVG 上传，降低公开图片内容注入面。
- service role 只允许在明确的服务端管理场景使用，不作为默认读取路径。

## 部署边界

- Vercel 负责 Next.js 构建、Server Actions 和静态资源分发。
- Supabase 负责 Auth、Postgres、RLS、Storage、Realtime 能力。
- 数据库迁移通过 `npx supabase db push` 推送，类型通过 `npm run supabase:types` 更新。

## Legacy 保留策略

原 Spring MVC + MyBatis + Shiro + MySQL + Tomcat 版本保存在：

- 分支：`legacy-java-mvc`
- 标签：`legacy-java-mvc-snapshot`

主分支只保留现代化 Next.js + Supabase 部署版。
