import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedRelations } from "./relation-policy.mjs";

const DATA_DIR = path.join(process.cwd(), ".local-data");
const DATA_FILE = path.join(DATA_DIR, "course-chat.json");

const DEFAULT_DATA = {
  nextMessageId: 3,
  profiles: [
    { id: "admin", role: "admin" },
    { id: "lin", role: "member" },
    { id: "miao", role: "moderator" }
  ],
  relations: seedRelations(),
  messages: [
    {
      id: 1,
      senderId: "miao",
      receiverId: "admin",
      content: "我把后台列表的字段整理好了，等你接本地 WebSocket。",
      read: false,
      clientMsgId: "seed-1",
      msgTime: 1779772200000,
      createdAt: "2026-05-26T13:10:00+08:00"
    },
    {
      id: 2,
      senderId: "admin",
      receiverId: "lin",
      content: "首页动效先轻一点，保证移动端不掉帧。",
      read: true,
      clientMsgId: "seed-2",
      msgTime: 1779770880000,
      createdAt: "2026-05-26T12:48:00+08:00"
    }
  ]
};

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    await writeData(DEFAULT_DATA);
    return structuredClone(DEFAULT_DATA);
  }
}

async function writeData(data) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readData() {
  const data = await ensureStore();
  return {
    nextMessageId: Number(data.nextMessageId ?? 1),
    profiles: Array.isArray(data.profiles) ? data.profiles : DEFAULT_DATA.profiles,
    relations: Array.isArray(data.relations) ? data.relations : seedRelations(),
    messages: Array.isArray(data.messages) ? data.messages : []
  };
}

export function toClientMessage(userId, item) {
  const fromSelf = item.senderId === userId;
  return {
    id: item.id,
    peerId: fromSelf ? item.receiverId : item.senderId,
    fromSelf,
    content: item.content,
    unread: !fromSelf && !item.read ? 1 : 0,
    clientMsgId: item.clientMsgId,
    createdAt: item.createdAt
  };
}

export async function getMessagesForUser(userId) {
  const data = await readData();
  return data.messages
    .filter((item) => item.senderId === userId || item.receiverId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((item) => toClientMessage(userId, item));
}

export async function appendMessage(senderId, receiverId, content, options = {}) {
  const data = await readData();
  const clientMsgId = String(options.clientMsgId ?? "").trim();
  if (clientMsgId) {
    const existing = data.messages.find((item) => item.senderId === senderId && item.clientMsgId === clientMsgId);
    if (existing) return { message: existing, duplicated: true };
  }

  const msgTime = Number(options.time ?? Date.now());
  const message = {
    id: data.nextMessageId,
    senderId,
    receiverId,
    content: String(content).trim(),
    read: false,
    clientMsgId: clientMsgId || `local-${data.nextMessageId}`,
    msgTime,
    createdAt: new Date(msgTime).toISOString()
  };
  data.nextMessageId += 1;
  data.messages.push(message);
  await writeData(data);
  return { message, duplicated: false };
}
