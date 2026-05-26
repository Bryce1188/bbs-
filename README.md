# 企业 BBS 系统（纯本地课程版）

这是一个用于课程验收的企业 BBS 系统。当前推荐运行方式是 **纯本地部署**：

- 前端与页面：Next.js App Router + React + TypeScript
- 本地服务：Node 自定义服务器
- 数据库：MySQL，本地库名 `bbs_course`
- 私信实时通信：本地 WebSocket，地址 `/ws/messages`
- 不依赖 Supabase、Vercel 或任何云端服务

本项目已覆盖课程图里的核心功能：用户注册、用户登录、忘记密码、修改用户信息、浏览帖子、发表帖子、回复帖子、删除帖子、管理员登录、板块管理、帖子管理、私信和关系等级权限。

## 1. 快速启动

### 1.1 环境要求

请先安装：

| 软件 | 建议版本 | 说明 |
| --- | --- | --- |
| Node.js | 20 或以上 | Next.js 16 需要 Node 20+ |
| npm | Node 自带即可 | 用于安装依赖和运行脚本 |
| MySQL | 8.x 推荐 | 项目默认会尝试启动本地独立 MySQL；也可以连接你自己安装的 MySQL |
| Git | 任意新版 | 用于拉代码和切换分支 |

Windows 推荐安装 MySQL Server 后确认存在这个目录：

```text
C:\Program Files\MySQL\MySQL Server 8.4\bin
```

如果你的 MySQL 安装目录不同，后面在 `.env.local` 里修改 `LOCAL_MYSQL_BIN_DIR`。

### 1.2 安装依赖

在项目根目录执行：

```bash
npm install
```

### 1.3 创建本地环境变量

复制示例文件：

```powershell
Copy-Item .env.example .env.local
```

如果你使用 Git Bash 或 macOS/Linux：

```bash
cp .env.example .env.local
```

`.env.local` 里本地课程版关键配置如下：

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

- `LOCAL_DB_PORT=3307` 是为了避开很多电脑已有的 MySQL `3306`。
- `LOCAL_DB_USER=bbs_app` 是应用连接数据库用的账号。
- `LOCAL_DB_PASSWORD=xzr1234567` 是应用数据库密码，不是云端密码。
- `LOCAL_DB_ADMIN_USER=root` 只在初始化数据库时使用。
- 如果你自己的 root 有密码，把 `LOCAL_DB_ADMIN_PASSWORD=` 改成你的 root 密码。

### 1.4 初始化数据库

执行：

```bash
npm run db:local:init
```

这个命令会做这些事：

- 启动项目自己的本地 MySQL 数据目录 `.local-mysql/`。
- 创建数据库 `bbs_course`。
- 创建或更新数据库账号 `bbs_app / xzr1234567`。
- 创建所有表。
- 清理旧测试数据。
- 写入管理员、5 个学生用户、板块、帖子、回复、点赞、收藏、关系和私信演示数据。

注意：`npm run db:local:init` 会重置本地演示数据。如果你自己已经在本地库里写了数据，运行前先备份。

### 1.5 启动项目

执行：

```bash
npm run dev:local
```

浏览器访问：

```text
http://localhost:3000
```

`npm run dev:local` 会先确保本地 MySQL 可用，再初始化数据库，然后启动带 WebSocket 的本地 Next.js 服务。

## 2. 默认账号

所有默认账号密码都是：

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

注册测试可以使用：

```text
1516924835@qq.com
xzr1234567
```

这个账号不是默认种子账号，用来验证“注册新用户”和“登录新用户”是否正常。

## 3. 数据库信息

默认数据库连接信息：

| 项 | 值 |
| --- | --- |
| 数据库类型 | MySQL |
| 主机 | `127.0.0.1` |
| 端口 | `3307` |
| 数据库名 | `bbs_course` |
| 应用账号 | `bbs_app` |
| 应用密码 | `xzr1234567` |
| 管理员初始化账号 | `root` |
| 管理员初始化密码 | 默认空，按你本机 MySQL 修改 |

数据库表：

| 表名 | 用途 |
| --- | --- |
| `users` | 用户、管理员、密码哈希、积分、签名 |
| `sessions` | 本地登录会话 |
| `password_reset_codes` | 本地忘记密码验证码 |
| `boards` | 板块 |
| `posts` | 帖子 |
| `replies` | 回复 |
| `post_likes` | 点赞 |
| `bookmarks` | 收藏 |
| `private_messages` | 私信消息 |
| `user_relations` | 用户关系等级 |

SQL 文件已经提交在：

```text
sql/local_bbs_mysql.sql
```

如果老师要求手动导入 SQL，可以使用：

```powershell
mysql -uroot -P3307 -h127.0.0.1 < sql\local_bbs_mysql.sql
```

如果 root 有密码：

```powershell
mysql -uroot -p -P3307 -h127.0.0.1 < sql\local_bbs_mysql.sql
```

如果你要给应用账号授权，可以在 MySQL 里执行：

```sql
create user if not exists 'bbs_app'@'localhost' identified by 'xzr1234567';
create user if not exists 'bbs_app'@'127.0.0.1' identified by 'xzr1234567';
grant all privileges on bbs_course.* to 'bbs_app'@'localhost';
grant all privileges on bbs_course.* to 'bbs_app'@'127.0.0.1';
flush privileges;
```

## 4. 功能验收路径

### 4.1 登录

1. 打开 `http://localhost:3000/auth`。
2. 输入 `xuzirui@qq.com`。
3. 输入密码 `xzr1234567`。
4. 点击“登录”。
5. 成功后会回到首页。

### 4.2 注册

1. 打开 `http://localhost:3000/auth`。
2. 在邮箱里输入 `1516924835@qq.com`。
3. 在密码里输入 `xzr1234567`。
4. 在名字里输入你的名字。
5. 点击“创建账号”。
6. 页面提示账号已创建后，可以直接登录。

注册字段要求：

- 名字：必填。
- 邮箱：必填，必须是邮箱格式。
- 密码：必填，至少 6 位。

### 4.3 忘记密码

1. 打开 `http://localhost:3000/auth/reset`。
2. 输入注册邮箱，例如 `1516924835@qq.com`。
3. 点击“发送重置邮件”。
4. 本地模式不会真的发邮件，页面会直接显示本地验证码。
5. 填写新密码并确认。
6. 点击“更新密码”。
7. 回到登录页后使用新密码登录。

### 4.4 发帖和回帖

1. 登录普通用户。
2. 打开 `http://localhost:3000/publish`。
3. 选择板块，填写标题、标签和正文。
4. 点击“发布帖子”。
5. 进入帖子详情后，在底部回复框填写内容。
6. 点击“提交回复”。

### 4.5 排行榜点击

1. 打开 `http://localhost:3000/rankings`。
2. 点击用户积分榜里的任意用户，会进入该用户主页。
3. 点击热门主题榜里的任意主题，会进入帖子详情页。

### 4.6 私信 WebSocket

1. 登录 `xuzirui@qq.com / xzr1234567`。
2. 打开 `http://localhost:3000/messages?peer=yaowentao`。
3. 页面右上角显示“已连接”。
4. 输入私信内容，点击“发送”。
5. 消息会写入 MySQL 的 `private_messages` 表，并通过 WebSocket 显示在页面上。

本地 WebSocket 地址：

```text
ws://localhost:3000/ws/messages?userId=xuzirui
```

兼容旧课程 WebSocket 地址：

```text
ws://localhost:3000/websocket/xuzirui
```

关系等级规则：

| 等级 | 含义 | 私信规则 |
| --- | --- | --- |
| L0 | 黑名单 | 禁止发送 |
| L1 | 陌生人 | 只允许有限打招呼 |
| L2 | 单向关注 | 可发送普通文本 |
| L3 | 互相关注 | 可发送链接 |
| L4 | 好友 | 正常私信 |
| L5 | 密友 | 预留高级关系 |

### 4.7 管理员后台

1. 登录 `user@qq.com / xzr1234567`。
2. 打开 `http://localhost:3000/admin`。
3. 可进入用户管理、板块管理、帖子管理、评论管理等页面。
4. 管理员可以调整角色、管理板块、管理帖子状态。

## 5. 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run db:local:init` | 初始化并重置本地 MySQL 数据库 |
| `npm run dev:local` | 启动本地 MySQL + Next.js + WebSocket |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run lint` | ESLint 检查 |
| `npm run build` | 构建检查 |
| `npm run test:e2e` | Playwright 端到端测试 |
| `npm run test` | 类型检查 + lint + build |

## 6. Playwright 测试

运行：

```bash
npm run test:e2e
```

测试覆盖：

- 默认用户登录。
- 发帖。
- 回帖。
- 首页主题点击进入详情。
- 管理员登录并查看后台帖子。
- 新用户注册。
- 忘记密码和重置密码。
- WebSocket 私信发送。

如果测试结束后数据库里出现 Playwright 测试数据，再运行一次：

```bash
npm run db:local:init
```

即可恢复干净演示数据。

## 7. 常见问题

### 7.1 端口 3000 被占用

现象：启动时报 `EADDRINUSE: address already in use 3000`。

解决：

```powershell
netstat -ano | findstr :3000
```

找到 PID 后结束进程：

```powershell
taskkill /PID 进程号 /F
```

然后重新运行：

```bash
npm run dev:local
```

### 7.2 端口 3307 被占用

现象：MySQL 启动失败或连接到了错误的库。

检查：

```powershell
netstat -ano | findstr :3307
```

如果被其他程序占用，可以修改 `.env.local`：

```env
LOCAL_DB_PORT=3308
```

改完后重新运行：

```bash
npm run db:local:init
npm run dev:local
```

### 7.3 找不到 mysqld.exe

现象：提示找不到 MySQL 可执行文件。

解决：打开 `.env.local`，把 `LOCAL_MYSQL_BIN_DIR` 改成你电脑真实的 MySQL `bin` 目录，例如：

```env
LOCAL_MYSQL_BIN_DIR=D:\Program Files\MySQL\MySQL Server 8.0\bin
```

### 7.4 root 密码错误

现象：`npm run db:local:init` 提示无法使用管理员账号连接 MySQL。

解决：修改 `.env.local`：

```env
LOCAL_DB_ADMIN_USER=root
LOCAL_DB_ADMIN_PASSWORD=你的root密码
```

然后重新运行：

```bash
npm run db:local:init
```

### 7.5 登录失败

先确认：

- 是否运行过 `npm run db:local:init`。
- `.env.local` 里的 `LOCAL_DB_PASSWORD` 是否为 `xzr1234567`。
- 登录密码是否输入 `xzr1234567`，不是旧密码 `1234567`。
- 当前是否连接的是 `127.0.0.1:3307/bbs_course`。

### 7.6 私信显示离线

本项目 WebSocket 需要通过自定义服务器启动，所以要使用：

```bash
npm run dev:local
```

不要用：

```bash
npm run dev
```

`npm run dev` 只启动普通 Next.js 开发服务器，不接管本地 WebSocket 网关。

### 7.7 页面还是旧数据

执行：

```bash
npm run db:local:init
```

然后刷新页面。如果浏览器缓存明显异常，可以关闭浏览器标签页重新打开。

## 8. 项目结构

```text
.
├── src/
│   ├── app/                 # 页面、路由和 Server Actions
│   ├── components/          # UI、论坛组件、私信组件
│   └── lib/                 # 本地 MySQL DAO、数据适配、类型
├── local-server/            # 本地 WebSocket 消息存储和关系策略
├── scripts/
│   ├── init-local-db.mjs    # 初始化本地 MySQL 数据库
│   ├── local-mysql.mjs      # 启动项目独立 MySQL
│   └── dev-local.mjs        # 本地完整启动入口
├── sql/
│   └── local_bbs_mysql.sql  # 课程提交用 MySQL 初始化 SQL
├── tests/e2e/               # Playwright 测试
├── .env.example             # 环境变量示例
├── package.json
└── server.mjs               # Next.js + WebSocket 自定义服务器
```

## 9. 技术说明

本地课程版采用分层结构：

| 层 | 文件/目录 | 职责 |
| --- | --- | --- |
| View | `src/app`, `src/components` | 页面、表单、排行榜、私信 UI |
| Controller | `src/app/actions.ts`, 路由文件 | 登录、注册、发帖、回帖、密码重置等动作入口 |
| Service | `local-server/relation-policy.mjs` | 私信关系等级和发送规则 |
| DAO | `src/lib/local-db.ts`, `local-server/mysql-message-store.mjs` | MySQL 数据读写 |
| Database | `bbs_course` | 用户、帖子、回复、私信等表 |

虽然前端使用 Next.js 实现，但整体仍按课程要求的 MVC 思路组织：页面负责展示，Action/Route 负责请求入口，Service 负责业务规则，DAO 负责数据库操作，MySQL 负责持久化。

## 10. 远程 Supabase 说明

仓库早期包含 Supabase/Vercel 远程部署能力，但当前作业交付以纯本地 MySQL 为准。小白本地部署时不要配置 Supabase，也不要运行 Vercel 部署命令。

如果 `.env.local` 不填写 Supabase 变量，系统会自动走本地 MySQL 模式。
