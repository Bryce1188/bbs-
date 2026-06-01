# BBS 校园论坛（Next.js + MySQL 本地版）

本项目已迁移为本地 MySQL 方案，支持：
- 账号注册/登录（Session + HttpOnly Cookie）
- 人机验证码注册
- 板块、发帖、评论、点赞、收藏、私信、通知、举报、后台管理
- Socket.IO 实时消息/通知

---

## 1. 环境要求

- Node.js >= 20
- MySQL 8.x
- Windows PowerShell（项目脚本基于 PowerShell）

---

## 2. 一键初始化（推荐）

在项目根目录执行：

```powershell
cd "F:\0000 job\0000 软件工程"
npm run setup:mysql
```

该命令会自动：
1. 安装依赖
2. 生成 `.env.local`
3. 导入 `mysql/bbs_mysql_all.sql`（结构）
4. 导入 `mysql/seed_restore_data.sql`（全中文种子数据）

---

## 3. 一键启动项目

```powershell
cd "F:\0000 job\0000 软件工程"
npm run start:all
```

启动后访问：
- [http://localhost:3000](http://localhost:3000)

如需强制重建数据库并重新导入数据：

```powershell
npm run start:all:force
```

---

## 4. 手动导入 SQL（可选）

如果你希望手动导入：

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" --default-character-set=utf8mb4 -h 127.0.0.1 -P 3306 -u root --password=123456 < ".\mysql\bbs_mysql_all.sql"
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" --default-character-set=utf8mb4 -h 127.0.0.1 -P 3306 -u root --password=123456 < ".\mysql\seed_restore_data.sql"
```

---

## 5. 关键 SQL 文件

- [bbs_mysql_all.sql](/F:/0000%20job/0000%20软件工程/mysql/bbs_mysql_all.sql)
- [seed_restore_data.sql](/F:/0000%20job/0000%20软件工程/mysql/seed_restore_data.sql)

---

## 6. 默认演示账号（管理员已包含）

### 管理员
- `admin@example.com / admin`
- `xzr@example.com / xzr`

### 版主
- `lp@example.com / lp`

### 普通用户
- `ywt@example.com / ywt`
- `lsw@example.com / lsw`
- `2063621186@qq.com / bryce123`（昵称：`Bryce`）

### 扩展三字母用户（30个）
密码规则：`用户名 + 123`  
示例：`zrq / zrq123`、`lwy / lwy123`、`cyj / cyj123`

---

## 7. 常用检查命令

```powershell
npm run typecheck
npm run lint
npm run build
```

