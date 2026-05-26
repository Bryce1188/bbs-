import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const config = {
  host: process.env.LOCAL_DB_HOST ?? "127.0.0.1",
  port: Number(process.env.LOCAL_DB_PORT ?? 3306),
  database: process.env.LOCAL_DB_NAME ?? "bbs_course",
  user: process.env.LOCAL_DB_USER ?? "bbs_app",
  password: process.env.LOCAL_DB_PASSWORD ?? "xzr1234567"
};

const adminConfig = {
  host: config.host,
  port: config.port,
  user: process.env.LOCAL_DB_ADMIN_USER ?? "root",
  password: process.env.LOCAL_DB_ADMIN_PASSWORD ?? process.env.LOCAL_DB_PASSWORD ?? "xzr1234567",
  multipleStatements: true
};

const users = [
  ["admin", "admin", "管理员", "user@qq.com", "admin", "系统管理员"],
  ["xuzirui", "xuzirui", "徐子锐", "xuzirui@qq.com", "member", "热爱交流与项目实践。"],
  ["yaowentao", "yaowentao", "姚文韬", "yaowentao@qq.com", "member", "关注技术分享和团队协作。"],
  ["luojunjie", "luojunjie", "骆俊杰", "luojunjie@qq.com", "member", "喜欢把问题拆清楚再解决。"],
  ["liupeng", "liupeng", "柳鹏", "liupeng@qq.com", "member", "记录学习和生活里的新发现。"],
  ["lishaowei", "lishaowei", "李少威", "lishaowei@qq.com", "member", "常驻论坛资源区。"]
];

const boards = [
  [1, "departments", "部门交融", "企业专区", "跨部门协作、流程沟通与经验交换。", "Network", "teal", 1],
  [2, "hobbies", "特长爱好", "企业专区", "运动、音乐、摄影、手作和生活灵感。", "Sparkles", "amber", 2],
  [3, "stories", "坊间趣事", "企业专区", "轻松讨论和社区见闻。", "MessagesSquare", "sky", 3],
  [4, "code", "编程开发", "交流与讨论", "项目、Bug、框架和工程实践。", "Code2", "indigo", 4],
  [5, "qa", "求助问答", "交流与讨论", "提问、解答、追问和问题归档。", "CircleHelp", "orange", 5]
];

const posts = [
  [1, "xuzirui", "企业 BBS 本地 MySQL 课程版说明", "本帖记录本地登录、发帖、回帖、私信和后台管理的验收路径。", "课程版,MVC,MySQL", "featured"],
  [4, "yaowentao", "WebSocket 私信联调记录", "本地 WebSocket 支持在线状态、点对点推送和关系等级校验。", "WebSocket,私信", "pinned"],
  [5, "luojunjie", "求助：发帖前应该准备哪些信息", "建议把问题背景、复现步骤、期望结果和错误截图写清楚。", "求助,规范", "normal"]
];

async function connectAsAdmin() {
  try {
    return await mysql.createConnection(adminConfig);
  } catch (error) {
    throw new Error(
      `无法使用管理员账号 ${adminConfig.user} 连接 MySQL。请设置 LOCAL_DB_ADMIN_USER/LOCAL_DB_ADMIN_PASSWORD 后重试。原始错误：${error.message}`
    );
  }
}

async function main() {
  const admin = await connectAsAdmin();
  if (!/^[a-zA-Z0-9_]+$/.test(config.user) || !/^[a-zA-Z0-9_]+$/.test(config.database)) {
    throw new Error("LOCAL_DB_USER 和 LOCAL_DB_NAME 只能包含字母、数字和下划线。");
  }
  await admin.query(`create database if not exists \`${config.database}\` default character set utf8mb4 collate utf8mb4_unicode_ci`);
  await admin.query(`create user if not exists '${config.user}'@'localhost' identified by ?`, [config.password]);
  await admin.query(`grant all privileges on \`${config.database}\`.* to '${config.user}'@'localhost'`);
  await admin.query(`flush privileges`);
  await admin.end();

  const db = await mysql.createConnection({ ...config, multipleStatements: true });
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

  const passwordHash = await bcrypt.hash("1234567", 10);
  for (const user of users) {
    await db.execute(
      `insert into users (id, username, display_name, email, password_hash, role, level_name, points, signature)
       values (?, ?, ?, ?, ?, ?, 'Lv.3 活跃成员', 100, ?)
       on duplicate key update display_name = values(display_name), email = values(email), role = values(role), signature = values(signature)`,
      [user[0], user[1], user[2], user[3], passwordHash, user[4], user[5]]
    );
  }

  for (const board of boards) {
    await db.execute(
      `insert into boards (id, slug, name, group_name, description, icon, theme_color, sort_order)
       values (?, ?, ?, ?, ?, ?, ?, ?)
       on duplicate key update name = values(name), group_name = values(group_name), description = values(description), icon = values(icon), theme_color = values(theme_color), sort_order = values(sort_order)`,
      board
    );
  }

  const existingPosts = await db.query(`select count(*) as count from posts`);
  if (Number(existingPosts[0][0].count) === 0) {
    for (const post of posts) {
      await db.execute(
        `insert into posts (board_id, author_id, title, excerpt, content, tags, status, reply_count, view_count)
         values (?, ?, ?, ?, ?, ?, ?, 0, 20)`,
        [post[0], post[1], post[2], post[3], post[3], post[4], post[5]]
      );
    }
    await db.query(`update boards b set post_count = (select count(*) from posts p where p.board_id = b.id and p.is_deleted = 0)`);
  }

  await db.execute(`insert ignore into user_relations (user_a, user_b, level) values ('admin', 'xuzirui', 4), ('admin', 'yaowentao', 4), ('xuzirui', 'yaowentao', 3)`);
  await db.end();
  console.log(`Local MySQL database ready: ${config.database} as ${config.user}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
