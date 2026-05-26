import nextEnv from "@next/env";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { pathToFileURL } from "node:url";
import { ensureLocalMySql } from "./local-mysql.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const config = {
  host: process.env.LOCAL_DB_HOST ?? "127.0.0.1",
  port: Number(process.env.LOCAL_DB_PORT ?? 3307),
  database: process.env.LOCAL_DB_NAME ?? "bbs_course",
  user: process.env.LOCAL_DB_USER ?? "bbs_app",
  password: process.env.LOCAL_DB_PASSWORD ?? "xzr1234567"
};

const adminConfig = {
  host: config.host,
  port: config.port,
  user: process.env.LOCAL_DB_ADMIN_USER ?? "root",
  password: process.env.LOCAL_DB_ADMIN_PASSWORD ?? "",
  multipleStatements: true
};

const localPassword = "xzr1234567";

const users = [
  ["admin", "admin", "管理员", "user@qq.com", "admin", "Lv.6 管理员", 980, "负责论坛板块、帖子和用户管理。"],
  ["xuzirui", "xuzirui", "徐子锐", "xuzirui@qq.com", "member", "Lv.5 核心成员", 860, "喜欢把课程项目做成可以真实演示的系统。"],
  ["yaowentao", "yaowentao", "姚文韬", "yaowentao@qq.com", "member", "Lv.4 活跃成员", 740, "关注前端体验、交互细节和团队协作。"],
  ["luojunjie", "luojunjie", "骆俊杰", "luojunjie@qq.com", "member", "Lv.4 活跃成员", 690, "习惯先整理需求，再拆解任务和测试路径。"],
  ["liupeng", "liupeng", "柳鹏", "liupeng@qq.com", "member", "Lv.3 分享达人", 620, "常分享学习资料、工具配置和踩坑记录。"],
  ["lishaowei", "lishaowei", "李少威", "lishaowei@qq.com", "member", "Lv.3 分享达人", 580, "关注后台管理、数据统计和课程文档。"]
];

const boards = [
  [1, "departments", "部门交融", "企业专区", "跨部门协作、流程沟通与经验交换。", "Network", "teal", 1, 2, 1],
  [2, "hobbies", "特长爱好", "企业专区", "运动、音乐、摄影、手作和生活灵感。", "Sparkles", "amber", 2, 2, 1],
  [3, "stories", "坊间趣事", "企业专区", "轻松讨论和社区见闻。", "MessagesSquare", "sky", 3, 1, 0],
  [4, "code", "编程开发", "交流与讨论", "项目、Bug、框架和工程实践。", "Code2", "indigo", 4, 2, 1],
  [5, "qa", "求助问答", "交流与讨论", "提问、解答、追问和问题归档。", "CircleHelp", "orange", 5, 1, 0]
];

const posts = [
  [101, 1, "xuzirui", "新人入职资料怎么统一整理比较好", "我们准备把入职流程、电脑配置、常用系统入口和联系人统一放到一个帖子里。", "最近几位同学入职时都会反复问到邮箱、代码仓库、测试环境、会议室预约这些入口。我的想法是把资料按“第一天必看、第一周熟悉、遇到问题找谁”三块整理，每块都配一个负责人。这样新人不用在群里翻历史消息，老成员也能少重复解释。大家如果有遗漏，可以直接在回复里补充。", "入职,协作,资料", "featured", 3, 168, 18, 6, "2026-05-22 09:20:00"],
  [102, 4, "yaowentao", "本地 WebSocket 私信联调记录", "私信中心已改成纯本地 WebSocket，消息落到 MySQL，适合课堂现场验收。", "这次私信没有走云端服务，浏览器连接 /ws/messages 后由本地 Node 服务接管。发送消息时会先检查用户关系等级，再写入 private_messages 表，最后同时推送给发送方和接收方。测试时可以用徐子锐和姚文韬两个账号分别打开两个浏览器窗口，发送后能实时看到消息。", "WebSocket,私信,MySQL", "pinned", 4, 232, 25, 9, "2026-05-23 14:35:00"],
  [103, 5, "luojunjie", "提问前建议补充哪些信息", "把问题背景、复现步骤、期望结果和截图说清楚，回复效率会高很多。", "论坛里的求助帖如果只有一句“这里报错了”，别人很难判断问题出在哪里。建议至少写清楚：当前做了什么、预期是什么、实际是什么、报错信息是什么、已经尝试过什么。代码类问题最好贴关键片段，环境类问题要说明 Node、MySQL、浏览器版本。", "求助,规范,效率", "normal", 2, 126, 12, 4, "2026-05-24 10:10:00"],
  [104, 2, "liupeng", "午休羽毛球活动报名", "本周三中午在体育馆约一场羽毛球，欢迎新同学一起参加。", "这周项目节奏比较紧，午休可以出来活动一下。地点暂定公司旁边体育馆，时间 12:20 到 13:10，自带球拍即可，没有球拍的可以在楼下借。想参加的同学在回复里说一声，方便统计人数。", "羽毛球,活动,午休", "normal", 2, 95, 9, 2, "2026-05-25 11:05:00"],
  [105, 3, "lishaowei", "茶水间咖啡机终于修好了", "之前出水慢的问题已经处理，早上排队时间明显短了。", "今天早上试了一下，咖啡机出水速度恢复正常了。维修师傅说主要是滤芯和管路的问题，后续行政会安排固定周期检查。大家如果再遇到异常，可以在这个帖子下面反馈，方便统一记录。", "茶水间,反馈", "normal", 1, 88, 7, 1, "2026-05-21 16:40:00"],
  [106, 4, "xuzirui", "本地部署时 MySQL 端口冲突怎么排查", "如果 3306 已经被占用，可以使用 3307 作为课程版本地数据库端口。", "很多同学电脑上已经装过 MySQL，默认 3306 经常被占用。本项目本地课程版默认使用 3307，并把数据放在 .local-mysql 目录里。如果启动失败，先看 README 的端口检查命令，再确认 .env.local 里的 LOCAL_DB_PORT 是否一致。", "MySQL,部署,排错", "normal", 2, 151, 14, 5, "2026-05-26 09:30:00"],
  [107, 2, "yaowentao", "首页移动端卡顿已经优化", "首页动画节奏调轻了一些，移动端滚动会更顺。", "昨天测试发现手机上首页首屏动画过多，低性能设备滚动时会有明显掉帧。现在减少了进入动画数量，把部分装饰效果改成静态渐变，列表渲染也做了更稳的布局。大家可以用自己的手机再帮忙看一下。", "前端,移动端,体验", "normal", 2, 142, 16, 3, "2026-05-26 13:10:00"],
  [108, 1, "luojunjie", "后台列表字段已经重新整理", "用户、帖子和评论管理页字段更接近课程验收需要。", "后台管理页面现在优先展示账号、角色、状态、主题标题、回复内容和处理入口，不再堆太多无关字段。这样老师检查时能更快看到管理员对板块和帖子进行管理的能力。后面如果要继续扩展，可以再加操作日志筛选。", "后台,管理,课程验收", "normal", 1, 118, 10, 2, "2026-05-26 15:45:00"]
];

const replies = [
  [101, "yaowentao", "可以加一个“常用链接”清单，把 Git 仓库、接口文档、测试地址都放进去。", 1, "2026-05-22 10:00:00"],
  [101, "liupeng", "建议再补一栏负责人，资料过期时能找到维护人。", 2, "2026-05-22 10:18:00"],
  [101, "admin", "这个方向可以，整理好后我放到公告区置顶。", 3, "2026-05-22 10:35:00"],
  [102, "xuzirui", "我用两个浏览器窗口试过，发送后能实时出现在对话里。", 1, "2026-05-23 15:05:00"],
  [102, "luojunjie", "关系等级限制也要写进 README，老师问权限设计时能直接展示。", 2, "2026-05-23 15:22:00"],
  [102, "admin", "验收时重点演示登录后进入私信、选择好友、发送消息这条链路。", 3, "2026-05-23 15:40:00"],
  [102, "lishaowei", "消息表字段已经和后台列表对齐，后续查数据更方便。", 4, "2026-05-23 16:10:00"],
  [103, "xuzirui", "可以把这个帖子放到求助问答板块顶部，当成发帖模板。", 1, "2026-05-24 10:35:00"],
  [103, "yaowentao", "前端报错最好附浏览器控制台截图，定位会快很多。", 2, "2026-05-24 10:48:00"],
  [104, "lishaowei", "我报名，一个人。", 1, "2026-05-25 11:30:00"],
  [104, "luojunjie", "我也参加，可以带两只备用球拍。", 2, "2026-05-25 11:46:00"],
  [105, "admin", "收到，行政这边会继续观察使用情况。", 1, "2026-05-21 17:10:00"],
  [106, "liupeng", "Windows 上可以用 netstat -ano 查占用端口的进程。", 1, "2026-05-26 09:50:00"],
  [106, "yaowentao", "README 里最好把 3307 的原因写清楚，避免同学误改。", 2, "2026-05-26 10:12:00"],
  [107, "xuzirui", "我手机上看已经顺很多，首屏加载没有之前那么重。", 1, "2026-05-26 13:40:00"],
  [107, "liupeng", "列表切换也正常，没有看到明显闪烁。", 2, "2026-05-26 14:02:00"],
  [108, "admin", "后台字段要保持简洁，课程演示以功能完整为主。", 1, "2026-05-26 16:00:00"]
];

const likes = [
  [101, "admin"], [101, "yaowentao"], [101, "liupeng"],
  [102, "admin"], [102, "xuzirui"], [102, "luojunjie"], [102, "lishaowei"],
  [103, "xuzirui"], [103, "yaowentao"],
  [104, "luojunjie"], [105, "admin"],
  [106, "yaowentao"], [106, "liupeng"], [107, "xuzirui"], [108, "admin"]
];

const bookmarks = [
  [101, "admin"], [102, "xuzirui"], [102, "yaowentao"], [103, "liupeng"], [106, "lishaowei"]
];

const relations = [
  ["admin", "xuzirui", 4], ["admin", "yaowentao", 4], ["admin", "luojunjie", 4],
  ["xuzirui", "yaowentao", 4], ["xuzirui", "luojunjie", 3], ["yaowentao", "lishaowei", 3],
  ["liupeng", "lishaowei", 4]
];

const messages = [
  ["yaowentao", "xuzirui", "我把私信页面的字段整理好了，等你接 WebSocket。", "seed-001", "2026-05-26 13:10:00"],
  ["xuzirui", "yaowentao", "收到，我现在改成本地 MySQL 持久化，发完再一起测。", "seed-002", "2026-05-26 13:16:00"],
  ["luojunjie", "xuzirui", "首页动效先轻一点，保证移动端不掉帧。", "seed-003", "2026-05-26 14:20:00"],
  ["xuzirui", "luojunjie", "可以，课程验收优先稳定，视觉细节后面再补。", "seed-004", "2026-05-26 14:28:00"],
  ["admin", "xuzirui", "后台和数据库说明要写进 README，老师会看部署步骤。", "seed-005", "2026-05-26 15:00:00"],
  ["xuzirui", "admin", "我会把账号、密码、SQL 和常见问题都写清楚。", "seed-006", "2026-05-26 15:08:00"]
];

function assertSafeIdentifier(value, label) {
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    throw new Error(`${label} 只能包含字母、数字和下划线。`);
  }
}

async function connectAsAdmin() {
  try {
    return await mysql.createConnection(adminConfig);
  } catch (error) {
    throw new Error(
      `无法使用管理员账号 ${adminConfig.user} 连接 MySQL。请设置 LOCAL_DB_ADMIN_USER/LOCAL_DB_ADMIN_PASSWORD 后重试。原始错误：${error.message}`
    );
  }
}

async function createSchema(db) {
  await db.query(`
    create table if not exists users (
      id varchar(40) primary key,
      username varchar(80) not null unique,
      display_name varchar(80) not null,
      email varchar(160) not null unique,
      password_hash varchar(255) not null,
      role enum('admin','moderator','member') not null default 'member',
      status enum('active','disabled') not null default 'active',
      avatar_path varchar(255) null,
      level_name varchar(80) not null default 'Lv.1 新人',
      points int not null default 0,
      signature varchar(255) not null default '',
      created_at timestamp not null default current_timestamp,
      updated_at timestamp not null default current_timestamp on update current_timestamp
    );
    create table if not exists sessions (
      token varchar(80) primary key,
      user_id varchar(40) not null,
      expires_at timestamp not null,
      created_at timestamp not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );
    create table if not exists password_reset_codes (
      user_id varchar(40) primary key,
      code varchar(12) not null,
      expires_at timestamp not null,
      created_at timestamp not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );
    create table if not exists boards (
      id int primary key,
      slug varchar(80) not null unique,
      name varchar(80) not null,
      group_name varchar(80) not null,
      description varchar(400) not null,
      icon varchar(80) not null,
      theme_color varchar(40) not null,
      sort_order int not null default 0,
      post_count int not null default 0,
      today_count int not null default 0
    );
    create table if not exists posts (
      id bigint primary key auto_increment,
      board_id int not null,
      author_id varchar(40) not null,
      title varchar(160) not null,
      excerpt varchar(255) not null,
      content text not null,
      tags varchar(255) not null default '',
      status enum('featured','pinned','normal') not null default 'normal',
      reply_count int not null default 0,
      view_count int not null default 0,
      like_count int not null default 0,
      collect_count int not null default 0,
      is_deleted tinyint(1) not null default 0,
      created_at timestamp not null default current_timestamp,
      updated_at timestamp not null default current_timestamp on update current_timestamp,
      foreign key (board_id) references boards(id),
      foreign key (author_id) references users(id)
    );
    create table if not exists replies (
      id bigint primary key auto_increment,
      post_id bigint not null,
      author_id varchar(40) not null,
      content text not null,
      seat int not null,
      is_visible tinyint(1) not null default 1,
      created_at timestamp not null default current_timestamp,
      foreign key (post_id) references posts(id) on delete cascade,
      foreign key (author_id) references users(id)
    );
    create table if not exists post_likes (
      id bigint primary key auto_increment,
      post_id bigint not null,
      user_id varchar(40) not null,
      created_at timestamp not null default current_timestamp,
      unique key uniq_post_like (post_id, user_id)
    );
    create table if not exists bookmarks (
      id bigint primary key auto_increment,
      post_id bigint not null,
      user_id varchar(40) not null,
      created_at timestamp not null default current_timestamp,
      unique key uniq_bookmark (post_id, user_id)
    );
    create table if not exists private_messages (
      id bigint primary key auto_increment,
      sender_id varchar(40) not null,
      receiver_id varchar(40) not null,
      content text not null,
      client_msg_id varchar(120) not null,
      msg_time bigint not null,
      is_read tinyint(1) not null default 0,
      created_at timestamp not null default current_timestamp,
      unique key uniq_sender_client_msg (sender_id, client_msg_id),
      key idx_pair_time (sender_id, receiver_id, created_at)
    );
    create table if not exists user_relations (
      id bigint primary key auto_increment,
      user_a varchar(40) not null,
      user_b varchar(40) not null,
      level tinyint not null default 1,
      created_at timestamp not null default current_timestamp,
      unique key uniq_relation_pair (user_a, user_b)
    );
  `);
}

async function resetSeedData(db) {
  await db.query(`
    set foreign_key_checks = 0;
    truncate table sessions;
    truncate table password_reset_codes;
    truncate table private_messages;
    truncate table user_relations;
    truncate table bookmarks;
    truncate table post_likes;
    truncate table replies;
    truncate table posts;
    truncate table boards;
    truncate table users;
    set foreign_key_checks = 1;
  `);
}

export async function initLocalDb() {
  await ensureLocalMySql();
  assertSafeIdentifier(config.user, "LOCAL_DB_USER");
  assertSafeIdentifier(config.database, "LOCAL_DB_NAME");

  const admin = await connectAsAdmin();
  await admin.query(`create database if not exists \`${config.database}\` default character set utf8mb4 collate utf8mb4_unicode_ci`);
  await admin.query(`create user if not exists '${config.user}'@'localhost' identified by ?`, [config.password]);
  await admin.query(`create user if not exists '${config.user}'@'127.0.0.1' identified by ?`, [config.password]);
  await admin.query(`alter user '${config.user}'@'localhost' identified by ?`, [config.password]);
  await admin.query(`alter user '${config.user}'@'127.0.0.1' identified by ?`, [config.password]);
  await admin.query(`grant all privileges on \`${config.database}\`.* to '${config.user}'@'localhost'`);
  await admin.query(`grant all privileges on \`${config.database}\`.* to '${config.user}'@'127.0.0.1'`);
  await admin.query("flush privileges");
  await admin.end();

  const db = await mysql.createConnection({ ...config, multipleStatements: true });
  await createSchema(db);
  await resetSeedData(db);

  const passwordHash = await bcrypt.hash(localPassword, 10);
  for (const user of users) {
    await db.execute(
      `insert into users (id, username, display_name, email, password_hash, role, level_name, points, signature)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user[0], user[1], user[2], user[3], passwordHash, user[4], user[5], user[6], user[7]]
    );
  }

  for (const board of boards) {
    await db.execute(
      `insert into boards (id, slug, name, group_name, description, icon, theme_color, sort_order, post_count, today_count)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      board
    );
  }

  for (const post of posts) {
    await db.execute(
      `insert into posts (id, board_id, author_id, title, excerpt, content, tags, status, reply_count, view_count, like_count, collect_count, created_at, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [post[0], post[1], post[2], post[3], post[4], post[5], post[6], post[7], post[8], post[9], post[10], post[11], post[12], post[12]]
    );
  }

  for (const reply of replies) {
    await db.execute(
      `insert into replies (post_id, author_id, content, seat, created_at) values (?, ?, ?, ?, ?)`,
      reply
    );
  }

  for (const like of likes) {
    await db.execute(`insert into post_likes (post_id, user_id) values (?, ?)`, like);
  }

  for (const bookmark of bookmarks) {
    await db.execute(`insert into bookmarks (post_id, user_id) values (?, ?)`, bookmark);
  }

  for (const relation of relations) {
    await db.execute(`insert into user_relations (user_a, user_b, level) values (?, ?, ?)`, relation);
  }

  for (const message of messages) {
    const createdAt = message[4];
    await db.execute(
      `insert into private_messages (sender_id, receiver_id, content, client_msg_id, msg_time, is_read, created_at)
       values (?, ?, ?, ?, unix_timestamp(?) * 1000, 0, ?)`,
      [message[0], message[1], message[2], message[3], createdAt, createdAt]
    );
  }

  await db.query(`alter table posts auto_increment = 1000`);
  await db.end();
  console.log(`Local MySQL database ready: ${config.database} as ${config.user}`);
  console.log(`Seed accounts use password: ${localPassword}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  initLocalDb().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
