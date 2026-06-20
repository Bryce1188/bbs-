# BBS 校园论坛

基于 Next.js、MySQL 和 Socket.IO 开发的校园论坛系统，支持用户注册与登录、板块管理、发帖与回复、点赞收藏、好友私信、通知、举报和后台管理。

## 技术与数据库版本

| 项目 | 版本/说明 |
| --- | --- |
| Node.js | 20 或更高版本 |
| Next.js | 16.2.6 |
| React | 19.2.0 |
| 数据库 | MySQL Community Server |
| 推荐数据库版本 | MySQL 8.4 LTS |
| SQL 兼容范围 | MySQL 8.x |
| MySQL 驱动 | mysql2 3.15.3 |
| 数据库名称 | `bbs_mysql` |
| 默认字符集 | `utf8mb4` |
| 默认排序规则 | `utf8mb4_0900_ai_ci` |
| 存储引擎 | InnoDB |

项目当前使用 MySQL 作为运行数据库，应用连接配置位于 `.env.local`，数据库访问代码位于 `src/lib/mysql.ts`。`supabase/` 目录保存的是早期迁移方案，不是当前运行环境所需的数据库。

## 数据库表

数据库结构定义在 [`mysql/bbs_mysql_all.sql`](mysql/bbs_mysql_all.sql)，共包含 22 张表。

| 表名 | 作用 | 主要关联 |
| --- | --- | --- |
| `users_auth` | 用户账号、邮箱和密码摘要 | 用户认证主表 |
| `profiles` | 用户名、昵称、头像、等级、积分和签名 | `id` 关联 `users_auth.id` |
| `roles` | 角色定义，如管理员、版主、普通用户 | 被 `user_roles` 引用 |
| `permissions` | 系统权限定义 | 被 `role_permissions` 引用 |
| `role_permissions` | 角色与权限的多对多关系 | 关联 `roles`、`permissions` |
| `user_roles` | 用户与角色的多对多关系 | 关联 `profiles`、`roles` |
| `boards` | 论坛板块及板块统计信息 | 被帖子和公告引用 |
| `posts` | 帖子标题、正文、标签和统计数据 | 关联 `boards`、`profiles` |
| `post_replies` | 帖子回复 | 关联 `posts`、`profiles` |
| `post_reactions` | 帖子点赞等互动记录 | 关联 `posts`、`profiles` |
| `bookmarks` | 用户收藏的帖子 | 关联 `profiles`、`posts` |
| `follows` | 用户关注关系 | 两端均关联 `profiles` |
| `friendships` | 好友申请及处理状态 | 两端均关联 `profiles` |
| `private_messages` | 用户私信、图片和已读状态 | 发送者和接收者关联 `profiles` |
| `notifications` | 回复、好友、系统和举报通知 | 关联 `profiles` |
| `reports` | 帖子举报及处理状态 | 关联举报用户和帖子 |
| `notices` | 全站或板块公告 | 可关联 `boards` |
| `checkins` | 用户每日签到和积分奖励 | 关联 `profiles` |
| `grades` | 用户等级及最低积分要求 | 独立等级配置表 |
| `audit_logs` | 后台操作审计记录 | 操作者关联 `profiles` |
| `user_sessions` | 登录会话及过期时间 | 关联 `users_auth` |
| `password_reset_tokens` | 密码重置令牌及使用状态 | 关联 `users_auth` |

脚本还创建了视图 `view_public_profiles`，仅提供可公开展示的用户资料字段。

## 核心关系

```text
users_auth 1 ── 1 profiles
profiles   N ── N roles         (通过 user_roles)
roles      N ── N permissions   (通过 role_permissions)
boards     1 ── N posts
posts      1 ── N post_replies
posts      1 ── N post_reactions
profiles   1 ── N posts / replies / messages / notifications
```

所有外键均在建表脚本中定义，并根据业务使用 `CASCADE`、`SET NULL` 或 `RESTRICT` 约束删除行为。

## 本地初始化

### 1. 安装环境

- Node.js 20+
- MySQL 8.4 LTS（或其他 MySQL 8.x 版本）
- Windows PowerShell

### 2. 配置与导入

在项目根目录执行：

```powershell
npm run setup:mysql
```

该命令会安装依赖、生成 `.env.local`，并依次导入：

1. `mysql/bbs_mysql_all.sql`：数据库结构和基础配置
2. `mysql/seed_restore_data.sql`：演示数据

也可以手动创建 `.env.local`：

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=bbs_mysql

SESSION_SECRET=replace-with-long-random-string
SESSION_TTL_HOURS=72
```

请在实际部署时修改数据库密码和 `SESSION_SECRET`，不要提交 `.env.local`。

### 3. 启动项目

```powershell
npm run start:all
```

访问 [http://localhost:3000](http://localhost:3000)。

如需强制重建数据库并重新导入演示数据：

```powershell
npm run start:all:force
```

## 常用命令

```powershell
npm run dev
npm run typecheck
npm run lint
npm run build
```

## 目录说明

```text
mysql/
  bbs_mysql_all.sql       # MySQL 数据库结构
  seed_restore_data.sql   # 演示数据
scripts/
  setup-local-mysql.ps1   # 本地数据库初始化
  start-all.ps1           # 数据库检查与项目启动
src/lib/mysql.ts          # MySQL 连接池
```
