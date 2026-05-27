# 企业 BBS 系统（`bendi_new` 本地课程分支）

> 仓库地址：`https://github.com/handsomeZR-netizen/bbs`  
> 课程提交分支：`bendi_new`  
> 本分支目标：**纯本地部署、前后端联动、MySQL 持久化、WebSocket 私信、满足老师验收要求**

---

## 1. 项目定位（先看这个）

`bendi_new` 是课程验收分支，默认走 **本地模式**：

- 前端：Next.js + React + TypeScript
- 后端：Node 自定义服务（`server.mjs`）
- 数据库：本地 MySQL（库名 `bbs_course`）
- 实时通信：本地 WebSocket（`/ws/messages`）
- 不依赖云端：不需要 Supabase / Vercel

这个分支已经做了课程要求对应的功能闭环：

- 普通用户：注册、登录、修改资料、浏览帖子、发帖、回帖、删除自己的帖子
- 管理员：登录后台、板块管理、帖子管理、用户管理
- 私信系统：关系等级 + WebSocket 实时消息 + MySQL 持久化

---

## 2. 老师验收对照（重点）

### 2.1 用例要求对照

| 老师要求 | 本分支实现 |
| --- | --- |
| 用户注册 | `/auth` 页面创建账号（名字/邮箱/密码） |
| 用户登录 | `/auth` 页面登录，本地会话写入 `sessions` 表 |
| 修改用户信息 | `/profile/[id]` 页面提交资料更新 |
| 浏览帖子 | 首页、板块页、搜索页、详情页 |
| 发表帖子 | `/publish` 发布帖子，写入 `posts` |
| 回复帖子 | `/posts/[id]` 回复，写入 `replies` |
| 删除帖子 | 帖子作者或管理员可删除（逻辑删除） |
| 管理员登录 | 管理员账号登录后访问 `/admin` |
| 版块管理 | `/admin/boards` |
| 帖子管理 | `/admin/posts` |
| 私信系统 | `/messages` + WebSocket + `private_messages` |

### 2.2 架构口径（课程 MVC 对照）

| 课程 MVC 口径 | 本分支对应实现 |
| --- | --- |
| View | `src/app`、`src/components` 页面和组件 |
| Controller | `src/app/actions.ts`、`route.ts` |
| Service | `local-server/relation-policy.mjs`（关系策略） |
| DAO | `src/lib/local-db.ts`、`local-server/mysql-message-store.mjs` |
| Model/DB | MySQL `bbs_course` 各业务表 |

---

## 3. 默认账号密码（必须看）

### 3.1 业务登录账号（用于网页登录）

统一密码：

```text
xzr1234567
```

| 角色 | 姓名 | 邮箱 | 密码 |
| --- | --- | --- | --- |
| 管理员 | 管理员 | `user@qq.com` | `xzr1234567` |
| 普通用户 | 徐子锐 | `xuzirui@qq.com` | `xzr1234567` |
| 普通用户 | 姚文韬 | `yaowentao@qq.com` | `xzr1234567` |
| 普通用户 | 骆俊杰 | `luojunjie@qq.com` | `xzr1234567` |
| 普通用户 | 柳鹏 | `liupeng@qq.com` | `xzr1234567` |
| 普通用户 | 李少威 | `lishaowei@qq.com` | `xzr1234567` |

### 3.2 数据库账号（用于应用连库）

| 用途 | 用户名 | 密码 |
| --- | --- | --- |
| 应用连接 MySQL | `bbs_app` | `xzr1234567` |
| MySQL 管理初始化 | `root` | 默认空（若你本机有密码，请在 `.env.local` 填写） |

---

## 4. 小白本地部署（Windows 一步一步）

## 4.1 环境准备

请先安装：

| 软件 | 建议版本 | 说明 |
| --- | --- | --- |
| Node.js | `>= 20` | Next.js 16 需要 |
| npm | Node 自带 | 安装依赖与脚本运行 |
| MySQL | 8.x 推荐 | 本项目默认使用本地独立数据目录 |
| Git | 任意新版 | 拉取和切分支 |

如果你安装了 MySQL Server，确认 `mysqld.exe` 目录类似：

```text
C:\Program Files\MySQL\MySQL Server 8.4\bin
```

---

## 4.2 拉代码并切到课程分支

```bash
git clone https://github.com/handsomeZR-netizen/bbs.git
cd bbs
git fetch origin
git switch bendi_new
```

如果本地没有 `bendi_new`，用：

```bash
git switch -c bendi_new origin/bendi_new
```

---

## 4.3 安装依赖

```bash
npm install
```

---

## 4.4 配置环境变量

复制：

```powershell
Copy-Item .env.example .env.local
```

`./.env.local` 关键项（默认可直接用）：

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

LOCAL_DB_HOST=127.0.0.1
LOCAL_DB_PORT=3307
LOCAL_DB_NAME=bbs_course
LOCAL_DB_USER=bbs_app
LOCAL_DB_PASSWORD=xzr1234567

LOCAL_DB_ADMIN_USER=root
LOCAL_DB_ADMIN_PASSWORD=
LOCAL_MYSQL_BIN_DIR=C:\Program Files\MySQL\MySQL Server 8.4\bin
```

说明：

- `3307` 是为了避免你电脑已有 MySQL `3306` 冲突。
- 如果你 root 有密码，把 `LOCAL_DB_ADMIN_PASSWORD` 改成真实值。
- 如果 MySQL 安装目录不同，请改 `LOCAL_MYSQL_BIN_DIR`。

---

## 4.5 初始化数据库（必须执行）

```bash
npm run db:local:init
```

该命令会自动：

- 启动/初始化本地 MySQL 数据目录 `.local-mysql/`
- 创建数据库 `bbs_course`
- 创建/更新应用账号 `bbs_app`
- 建表并写入演示种子数据（含 6 个账号）
- 清理历史测试脏数据

---

## 4.6 启动方式

### 开发模式（推荐调试）

```bash
npm run dev:local
```

### 生产模式（老师验收演示可用）

```bash
npm run build
node server.mjs
```

访问：

```text
http://localhost:3000
```

---

## 5. 数据库 SQL 文件（作业可提交）

本仓库已提供：

```text
sql/local_bbs_mysql.sql
```

老师要求手动导入时可以用：

```powershell
mysql -uroot -P3307 -h127.0.0.1 < sql\local_bbs_mysql.sql
```

如果 root 有密码：

```powershell
mysql -uroot -p -P3307 -h127.0.0.1 < sql\local_bbs_mysql.sql
```

---

## 6. 验收演示路径（建议按顺序）

1. 登录普通用户：`xuzirui@qq.com / xzr1234567`
2. 发帖：`/publish`
3. 回帖：进入帖子详情
4. 排行榜点击：`/rankings`（用户和主题都可点击）
5. 私信：`/messages`（可发消息、看在线状态）
6. 好友申请：在私信页搜索用户发申请，另一账号接受
7. 管理员登录：`user@qq.com / xzr1234567`
8. 后台管理：`/admin`、`/admin/boards`、`/admin/posts`

---

## 7. 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run db:local:init` | 初始化/重置本地数据库 |
| `npm run dev:local` | 本地开发服务（含 WebSocket） |
| `npm run build` | 生产构建 |
| `node server.mjs` | 启动生产服务 |
| `npm run typecheck` | TS 检查 |
| `npm run lint` | 代码规范检查 |
| `npm run test:e2e` | Playwright E2E 测试 |

---

## 8. 常见问题排查（小白版）

### 8.1 端口 3000 被占用

```powershell
netstat -ano | findstr :3000
taskkill /PID 进程号 /F
```

### 8.2 端口 3307 被占用

```powershell
netstat -ano | findstr :3307
```

改 `.env.local` 的 `LOCAL_DB_PORT` 后，重新：

```bash
npm run db:local:init
```

### 8.3 登录失败

按顺序检查：

1. 你是否在 `bendi_new` 分支
2. 是否执行过 `npm run db:local:init`
3. 密码是否是 `xzr1234567`（不是旧密码）
4. 使用的邮箱是否在默认账号表里

### 8.4 私信不实时

请确认是以下启动方式之一：

- `npm run dev:local`
- `npm run build` 后 `node server.mjs`

不要只跑 `npm run dev`，否则没有自定义 WebSocket 网关逻辑。

---

## 9. 说明

- 这个分支用于课程验收，强调本地可跑、功能完整、数据可验证。
- 生产演示前建议再执行一次 `npm run db:local:init`，保证数据干净一致。
- 如果你给同学演示部署，直接把这份 README 发给他，按步骤执行即可。

