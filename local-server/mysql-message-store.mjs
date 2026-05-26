import mysql from "mysql2/promise";

const LOCAL_MESSAGE_POOL_KEY = Symbol.for("bbs.local.mysql.message.pool");

function getPool() {
  const globalScope = globalThis;
  globalScope[LOCAL_MESSAGE_POOL_KEY] ??= mysql.createPool({
    host: process.env.LOCAL_DB_HOST ?? "127.0.0.1",
    port: Number(process.env.LOCAL_DB_PORT ?? 3307),
    database: process.env.LOCAL_DB_NAME ?? "bbs_course",
    user: process.env.LOCAL_DB_USER ?? "bbs_app",
    password: process.env.LOCAL_DB_PASSWORD ?? "xzr1234567",
    charset: "utf8mb4",
    timezone: "+08:00",
    connectionLimit: 4
  });
  return globalScope[LOCAL_MESSAGE_POOL_KEY];
}

async function query(sql, params = []) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

async function execute(sql, params = []) {
  const [result] = await getPool().execute(sql, params);
  return result;
}

function toIso(value) {
  if (value instanceof Date) return value.toISOString();
  return new Date(String(value)).toISOString();
}

export function toClientMessage(userId, item) {
  const fromSelf = item.sender_id === userId || item.senderId === userId;
  const senderId = item.sender_id ?? item.senderId;
  const receiverId = item.receiver_id ?? item.receiverId;
  return {
    id: Number(item.id),
    peerId: fromSelf ? receiverId : senderId,
    fromSelf,
    content: item.content,
    unread: !fromSelf && !item.is_read ? 1 : 0,
    clientMsgId: item.client_msg_id ?? item.clientMsgId,
    createdAt: toIso(item.created_at ?? item.createdAt)
  };
}

export async function readPolicyData() {
  const [profiles, relations, messages] = await Promise.all([
    query(`select id, role from users`),
    query(`select user_a as a, user_b as b, level from user_relations`),
    query(`select sender_id as senderId, receiver_id as receiverId, created_at as createdAt from private_messages order by created_at desc limit 500`)
  ]);
  return { profiles, relations, messages };
}

export async function getMessagesForUser(userId) {
  const rows = await query(
    `select * from private_messages where sender_id = ? or receiver_id = ? order by created_at desc limit 100`,
    [userId, userId]
  );
  return rows.map((item) => toClientMessage(userId, item));
}

export async function appendMessage(senderId, receiverId, content, options = {}) {
  const clientMsgId = String(options.clientMsgId ?? "").trim() || crypto.randomUUID();
  const existing = await query(`select * from private_messages where sender_id = ? and client_msg_id = ? limit 1`, [senderId, clientMsgId]);
  if (existing[0]) return { message: existing[0], duplicated: true };

  const msgTime = Number(options.time ?? Date.now());
  const result = await execute(
    `insert into private_messages (sender_id, receiver_id, content, client_msg_id, msg_time, created_at)
     values (?, ?, ?, ?, ?, from_unixtime(? / 1000))`,
    [senderId, receiverId, String(content).trim(), clientMsgId, msgTime, msgTime]
  );
  const rows = await query(`select * from private_messages where id = ?`, [result.insertId]);
  return { message: rows[0], duplicated: false };
}
