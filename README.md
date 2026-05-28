# BBS 星桥社区（Next.js + MySQL 本地版）

本仓库已从 Supabase 全量迁移到 **本地 MySQL**，支持：

- Session + HttpOnly Cookie 登录
- 人机验证码注册（前端大小写不敏感）
- 板块/帖子/回复/点赞/收藏/举报/私信/通知/后台管理
- Socket.IO 私信与通知实时刷新
- 单文件 SQL 交付（课程可直接上交）

---

## 1. 环境要求

- Node.js >= 20
- MySQL 8.x（本机）

---

## 2. SQL 交付文件（单文件）

课程 SQL 文件在：

- [mysql/bbs_mysql_all.sql](/F:/0000%20job/0000%20软件工程/mysql/bbs_mysql_all.sql)

该文件包含：

- 建库建表、索引、外键
- 公开资料视图 `view_public_profiles`
- 过程：`sp_create_post` / `sp_create_reply` / `sp_toggle_post_reaction` / `sp_toggle_bookmark`
- 角色权限模型（`roles/permissions/role_permissions/user_roles`）
- 12 个板块和基础演示数据

---

## 3. 启动 MySQL（Windows）

先启动 MySQL，再启动网站。

### 3.1 启动 MySQL 服务进程

```powershell
Start-Process -FilePath "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" -ArgumentList "--defaults-file=C:\Users\epiph\.codex\memories\mysql-bbs.ini --console" -WindowStyle Hidden
```

### 3.2 检查 3306 端口是否可用

```powershell
Test-NetConnection 127.0.0.1 -Port 3306
```

如果输出里 `TcpTestSucceeded` 是 `True`，说明数据库已启动成功。

---

## 4. 本地一键初始化（Windows PowerShell）

```powershell
cd "F:\0000 job\0000 软件工程"
npm run setup:mysql
```

`setup:mysql` 会执行：

1. `npm install`
2. 写入 `.env.local`
3. 导入 `mysql/bbs_mysql_all.sql`

---

## 5. 手动初始化（可选）

### 5.1 导入 SQL

```powershell
cd "F:\0000 job\0000 软件工程"
Get-Content -Raw ".\mysql\bbs_mysql_all.sql" | mysql -h 127.0.0.1 -P 3306 -u root --password=123456
```

如果你的系统提示找不到 `mysql` 命令，可以改用完整路径：

```powershell
Get-Content -Raw ".\mysql\bbs_mysql_all.sql" | & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -h 127.0.0.1 -P 3306 -u root --password=123456
```

### 5.2 配置环境变量

参考：

- [.env.example](/F:/0000%20job/0000%20软件工程/.env.example)

至少包含：

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=bbs_mysql

SESSION_SECRET=your-long-random-string
SESSION_TTL_HOURS=72
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 6. 启动项目

```powershell
cd "F:\0000 job\0000 软件工程"
npm run start:all
```

访问：

- [http://localhost:3000](http://localhost:3000)

`start:all` 会自动执行：

1. 检查 Node.js / npm
2. 检查并尝试启动 MySQL 服务（如果已安装为 Windows 服务）
3. 检测 MySQL 连通性
4. 如发现数据库未初始化，自动导入 `mysql/bbs_mysql_all.sql`
5. 启动论坛前端服务

如果你需要强制重置数据库并重新导入 SQL：

```powershell
npm run start:all:force
```

---

## 7. 测试与构建

```powershell
npm run typecheck
npm run lint
npm run build
```

---

## 8. 默认说明

- Session Cookie 名称：`bbs_session`
- 用户主键：UUID 字符串
- 图片：先用路径字段入库（不依赖对象存储）
- WebSocket：`/socket.io`，按 `user:{id}` 房间推送
