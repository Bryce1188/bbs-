import "server-only";

import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { cookies } from "next/headers";
import type {
  AuditLogItem,
  Board,
  FriendshipItem,
  Message,
  NotificationItem,
  NoticeItem,
  Post,
  Profile,
  Reply,
  ReportItem,
  RoleItem
} from "@/lib/types";

const SESSION_COOKIE = "bbs_local_session";

let pool: mysql.Pool | null = null;

type LocalSqlValue = string | number | boolean | Date | null | Buffer | Uint8Array;

function dbConfig() {
  return {
    host: process.env.LOCAL_DB_HOST ?? "127.0.0.1",
    port: Number(process.env.LOCAL_DB_PORT ?? 3306),
    database: process.env.LOCAL_DB_NAME ?? "bbs_course",
    user: process.env.LOCAL_DB_USER ?? "bbs_app",
    password: process.env.LOCAL_DB_PASSWORD ?? "xzr1234567",
    charset: "utf8mb4",
    timezone: "+08:00",
    connectionLimit: 10
  };
}

export function getLocalPool() {
  pool ??= mysql.createPool(dbConfig());
  return pool;
}

async function query<T extends mysql.RowDataPacket[]>(sql: string, params: LocalSqlValue[] = []) {
  const [rows] = await getLocalPool().query<T>(sql, params);
  return rows;
}

async function execute(sql: string, params: LocalSqlValue[] = []) {
  const [result] = await getLocalPool().execute<mysql.ResultSetHeader>(sql, params);
  return result;
}

function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return new Date(String(value)).toISOString();
}

function avatarFor(id: string) {
  if (id === "admin") return "/avatars/admin.svg";
  return id.length % 2 === 0 ? "/avatars/member-a.svg" : "/avatars/member-b.svg";
}

function mapBoard(row: mysql.RowDataPacket): Board {
  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    group: row.group_name,
    description: row.description,
    icon: row.icon,
    themeColor: row.theme_color,
    sortOrder: Number(row.sort_order),
    postCount: Number(row.post_count),
    todayCount: Number(row.today_count)
  };
}

function mapProfile(row: mysql.RowDataPacket): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar_path || avatarFor(row.id),
    role: row.role,
    level: row.level_name,
    points: Number(row.points),
    joinedAt: toIso(row.created_at),
    signature: row.signature ?? ""
  };
}

function mapPost(row: mysql.RowDataPacket): Post {
  return {
    id: Number(row.id),
    boardId: Number(row.board_id),
    authorId: row.author_id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content ?? "",
    tags: row.tags ? String(row.tags).split(",").filter(Boolean) : [],
    status: row.status,
    replyCount: Number(row.reply_count),
    viewCount: Number(row.view_count),
    likeCount: Number(row.like_count),
    collectCount: Number(row.collect_count),
    viewerHasLiked: Boolean(row.viewer_has_liked),
    viewerHasBookmarked: Boolean(row.viewer_has_bookmarked),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function mapReply(row: mysql.RowDataPacket): Reply {
  return {
    id: Number(row.id),
    postId: Number(row.post_id),
    authorId: row.author_id,
    content: row.content,
    seat: Number(row.seat),
    visible: Boolean(row.is_visible),
    createdAt: toIso(row.created_at)
  };
}

export async function getCurrentLocalUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await query(
    `select u.* from sessions s join users u on u.id = s.user_id where s.token = ? and s.expires_at > now() limit 1`,
    [token]
  );
  return rows[0] ? mapProfile(rows[0]) : null;
}

export async function getCurrentLocalUserId() {
  return (await getCurrentLocalUser())?.id ?? null;
}

export async function signInLocal(email: string, password: string) {
  const rows = await query(`select * from users where email = ? and status = 'active' limit 1`, [email.toLowerCase()]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return false;
  }

  const token = crypto.randomUUID();
  await execute(`insert into sessions (token, user_id, expires_at) values (?, ?, date_add(now(), interval 7 day))`, [token, user.id]);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return true;
}

export async function signOutLocal() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await execute(`delete from sessions where token = ?`, [token]);
  cookieStore.delete(SESSION_COOKIE);
}

export async function signUpLocal(displayName: string, email: string, password: string) {
  const normalizedEmail = email.toLowerCase();
  const username = normalizedEmail.split("@")[0];
  const existing = await query(`select id from users where email = ? limit 1`, [normalizedEmail]);
  if (existing.length) return { ok: false, code: "email_exists" };

  const passwordHash = await bcrypt.hash(password, 10);
  await execute(
    `insert into users (id, username, display_name, email, password_hash, role, level_name, points, signature)
     values (?, ?, ?, ?, ?, 'member', 'Lv.1 新人', 0, '这个人还没有填写签名。')`,
    [username, username, displayName, normalizedEmail, passwordHash]
  );
  return { ok: true, code: "created" };
}

export async function createPasswordResetCodeLocal(email: string) {
  const rows = await query(`select id from users where email = ? limit 1`, [email.toLowerCase()]);
  if (!rows[0]) return null;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await execute(`delete from password_reset_codes where user_id = ?`, [rows[0].id]);
  await execute(`insert into password_reset_codes (user_id, code, expires_at) values (?, ?, date_add(now(), interval 10 minute))`, [
    rows[0].id,
    code
  ]);
  return code;
}

export async function updatePasswordWithCodeLocal(email: string, code: string, password: string) {
  const rows = await query(
    `select u.id from users u join password_reset_codes c on c.user_id = u.id
     where u.email = ? and c.code = ? and c.expires_at > now() limit 1`,
    [email.toLowerCase(), code]
  );
  if (!rows[0]) return false;
  await execute(`update users set password_hash = ? where id = ?`, [await bcrypt.hash(password, 10), rows[0].id]);
  await execute(`delete from password_reset_codes where user_id = ?`, [rows[0].id]);
  return true;
}

export async function getLocalBoards() {
  const rows = await query(`select * from boards order by sort_order asc, id asc`);
  return rows.map(mapBoard);
}

export async function getLocalProfiles() {
  const rows = await query(`select * from users order by created_at desc`);
  return rows.map(mapProfile);
}

export async function getLocalAdminProfiles() {
  return getLocalProfiles();
}

export async function getLocalProfile(id: string) {
  const rows = await query(`select * from users where id = ? limit 1`, [id]);
  return rows[0] ? mapProfile(rows[0]) : undefined;
}

export async function getLocalHomeStats() {
  const [users, posts, replies, todayPosts] = await Promise.all([
    query(`select count(*) as count from users`),
    query(`select count(*) as count from posts where is_deleted = 0`),
    query(`select count(*) as count from replies where is_visible = 1`),
    query(`select count(*) as count from posts where is_deleted = 0 and date(created_at) = curdate()`)
  ]);
  return {
    users: Number(users[0].count),
    posts: Number(posts[0].count),
    replies: Number(replies[0].count),
    online: 0,
    todayPosts: Number(todayPosts[0].count)
  };
}

async function postRows(whereSql = "where p.is_deleted = 0", params: LocalSqlValue[] = [], limit = 50, includeContent = false) {
  const viewer = await getCurrentLocalUserId();
  return query(
    `select p.id, p.board_id, p.author_id, p.title, p.excerpt, ${includeContent ? "p.content" : "'' as content"},
       p.tags, p.status, p.reply_count, p.view_count, p.like_count, p.collect_count, p.created_at, p.updated_at,
       ${viewer ? "exists(select 1 from post_likes pl where pl.post_id = p.id and pl.user_id = ?) " : "false "} as viewer_has_liked,
       ${viewer ? "exists(select 1 from bookmarks bm where bm.post_id = p.id and bm.user_id = ?) " : "false "} as viewer_has_bookmarked
     from posts p ${whereSql}
     order by p.updated_at desc limit ?`,
    [...(viewer ? [viewer, viewer] : []), ...params, limit]
  );
}

export async function getLocalPosts(limit = 50, options: { includeContent?: boolean } = {}) {
  return (await postRows("where p.is_deleted = 0", [], limit, Boolean(options.includeContent))).map(mapPost);
}

export async function getLocalBoardPosts(boardId: number, options: { includeContent?: boolean } = {}) {
  return (await postRows("where p.is_deleted = 0 and p.board_id = ?", [boardId], 100, Boolean(options.includeContent))).map(mapPost);
}

export async function getLocalProfilePosts(profileId: string) {
  return (await postRows("where p.is_deleted = 0 and p.author_id = ?", [profileId], 50, false)).map(mapPost);
}

export async function getLocalPost(id: number) {
  await execute(`update posts set view_count = view_count + 1 where id = ? and is_deleted = 0`, [id]);
  const posts = (await postRows("where p.is_deleted = 0 and p.id = ?", [id], 1, true)).map(mapPost);
  const post = posts[0];
  if (!post) return undefined;
  const [profiles, boards, replyRows] = await Promise.all([
    getLocalProfiles(),
    getLocalBoards(),
    query(`select * from replies where post_id = ? and is_visible = 1 order by seat asc`, [id])
  ]);
  return {
    post,
    author: profiles.find((profile) => profile.id === post.authorId),
    board: boards.find((board) => board.id === post.boardId),
    replies: replyRows.map(mapReply),
    profiles,
    viewerHasLiked: post.viewerHasLiked,
    viewerHasBookmarked: post.viewerHasBookmarked
  };
}

export async function createLocalPost(boardId: number, title: string, content: string, tags: string[]) {
  const user = await getCurrentLocalUser();
  if (!user) return null;
  const excerpt = content.slice(0, 120);
  const result = await execute(
    `insert into posts (board_id, author_id, title, excerpt, content, tags, status) values (?, ?, ?, ?, ?, ?, 'normal')`,
    [boardId, user.id, title, excerpt, content, tags.join(",")]
  );
  await execute(`update boards set post_count = post_count + 1, today_count = today_count + 1 where id = ?`, [boardId]);
  return result.insertId;
}

export async function createLocalReply(postId: number, content: string) {
  const user = await getCurrentLocalUser();
  if (!user) return false;
  const seats = await query(`select coalesce(max(seat), 0) + 1 as seat from replies where post_id = ?`, [postId]);
  await execute(`insert into replies (post_id, author_id, content, seat) values (?, ?, ?, ?)`, [postId, user.id, content, seats[0].seat]);
  await execute(`update posts set reply_count = reply_count + 1, updated_at = now() where id = ?`, [postId]);
  return true;
}

export async function toggleLocalLike(postId: number) {
  const userId = await getCurrentLocalUserId();
  if (!userId) return null;
  const existing = await query(`select id from post_likes where post_id = ? and user_id = ? limit 1`, [postId, userId]);
  if (existing.length) {
    await execute(`delete from post_likes where post_id = ? and user_id = ?`, [postId, userId]);
    await execute(`update posts set like_count = greatest(like_count - 1, 0) where id = ?`, [postId]);
    return false;
  }
  await execute(`insert into post_likes (post_id, user_id) values (?, ?)`, [postId, userId]);
  await execute(`update posts set like_count = like_count + 1 where id = ?`, [postId]);
  return true;
}

export async function toggleLocalBookmark(postId: number) {
  const userId = await getCurrentLocalUserId();
  if (!userId) return null;
  const existing = await query(`select id from bookmarks where post_id = ? and user_id = ? limit 1`, [postId, userId]);
  if (existing.length) {
    await execute(`delete from bookmarks where post_id = ? and user_id = ?`, [postId, userId]);
    await execute(`update posts set collect_count = greatest(collect_count - 1, 0) where id = ?`, [postId]);
    return false;
  }
  await execute(`insert into bookmarks (post_id, user_id) values (?, ?)`, [postId, userId]);
  await execute(`update posts set collect_count = collect_count + 1 where id = ?`, [postId]);
  return true;
}

export async function deleteLocalPost(postId: number) {
  const user = await getCurrentLocalUser();
  if (!user) return false;
  const rows = await query(`select author_id from posts where id = ? and is_deleted = 0 limit 1`, [postId]);
  if (!rows[0]) return false;
  if (rows[0].author_id !== user.id && user.role !== "admin" && user.role !== "moderator") return false;
  await execute(`update posts set is_deleted = 1, updated_at = now() where id = ?`, [postId]);
  return true;
}

export async function updateLocalProfile(displayName: string, signature: string) {
  const user = await getCurrentLocalUser();
  if (!user) return false;
  await execute(`update users set display_name = ?, signature = ? where id = ?`, [displayName, signature, user.id]);
  return true;
}

export async function updateLocalBoard(board: Pick<Board, "id" | "name" | "group" | "description" | "icon" | "themeColor" | "sortOrder">) {
  await execute(
    `update boards set name = ?, group_name = ?, description = ?, icon = ?, theme_color = ?, sort_order = ? where id = ?`,
    [board.name, board.group, board.description, board.icon, board.themeColor, board.sortOrder, board.id]
  );
}

export async function updateLocalPostStatus(postId: number, status: Post["status"]) {
  await execute(`update posts set status = ?, updated_at = now() where id = ?`, [status, postId]);
}

export async function assignLocalRole(userId: string, role: Profile["role"]) {
  await execute(`update users set role = ? where id = ?`, [role, userId]);
}

export async function getLocalMessages(userId: string): Promise<Message[]> {
  const rows = await query(
    `select * from private_messages where sender_id = ? or receiver_id = ? order by created_at desc limit 100`,
    [userId, userId]
  );
  return rows.map((row) => {
    const fromSelf = row.sender_id === userId;
    return {
      id: Number(row.id),
      peerId: fromSelf ? row.receiver_id : row.sender_id,
      fromSelf,
      content: row.content,
      unread: !fromSelf && !row.is_read ? 1 : 0,
      clientMsgId: row.client_msg_id,
      createdAt: toIso(row.created_at)
    };
  });
}

export async function appendLocalMessage(senderId: string, receiverId: string, content: string, clientMsgId: string, msgTime: number) {
  if (clientMsgId) {
    const existing = await query(`select * from private_messages where sender_id = ? and client_msg_id = ? limit 1`, [senderId, clientMsgId]);
    if (existing[0]) return { row: existing[0], duplicated: true };
  }
  const result = await execute(
    `insert into private_messages (sender_id, receiver_id, content, client_msg_id, msg_time, created_at) values (?, ?, ?, ?, ?, from_unixtime(? / 1000))`,
    [senderId, receiverId, content, clientMsgId || crypto.randomUUID(), msgTime, msgTime]
  );
  const rows = await query(`select * from private_messages where id = ?`, [result.insertId]);
  return { row: rows[0], duplicated: false };
}

export async function getLocalFriendships(): Promise<FriendshipItem[]> {
  const userId = await getCurrentLocalUserId();
  if (!userId) return [];
  const rows = await query(`select * from user_relations where user_a = ? or user_b = ? order by created_at desc`, [userId, userId]);
  return rows.map((row) => ({
    id: Number(row.id),
    requesterId: row.user_a,
    addresseeId: row.user_b,
    status: Number(row.level) >= 4 ? "accepted" : "pending",
    createdAt: toIso(row.created_at)
  }));
}

export async function getLocalNotifications(): Promise<NotificationItem[]> {
  return [
    { id: 1, type: "system", title: "本地课程版已启用", description: "认证、帖子、回复、私信和后台均使用本地 MySQL。", read: false, createdAt: new Date().toISOString() }
  ];
}

export async function getLocalReports(): Promise<ReportItem[]> {
  return [];
}

export async function getLocalReplies(): Promise<Reply[]> {
  const rows = await query(`select * from replies where is_visible = 1 order by created_at desc limit 100`);
  return rows.map(mapReply);
}

export async function getLocalNotices(): Promise<NoticeItem[]> {
  return [];
}

export function getLocalRoles(): RoleItem[] {
  return [
    { id: 1, code: "admin", name: "管理员", description: "拥有后台管理权限" },
    { id: 2, code: "moderator", name: "版主", description: "可管理主题和回复" },
    { id: 3, code: "member", name: "普通用户", description: "可发帖、回帖和私信" }
  ];
}

export function getLocalAuditLogs(): AuditLogItem[] {
  return [{ id: 1, actorId: "admin", action: "local_mysql_enabled", targetType: "system", targetId: "bbs_course", createdAt: new Date().toISOString() }];
}

export async function requireLocalAdmin() {
  const user = await getCurrentLocalUser();
  return user?.role === "admin" || user?.role === "moderator";
}
