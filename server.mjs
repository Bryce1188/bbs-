import http from "node:http";
import next from "next";
import nextEnv from "@next/env";
import { WebSocketServer } from "ws";
import { appendMessage, getMessagesForUser, readPolicyData, toClientMessage } from "./local-server/mysql-message-store.mjs";
import { canSendMessage } from "./local-server/relation-policy.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = Number(process.env.PORT ?? 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const clients = new Map();

function addClient(userId, ws) {
  const sockets = clients.get(userId) ?? new Set();
  sockets.add(ws);
  clients.set(userId, sockets);
}

function removeClient(userId, ws) {
  const sockets = clients.get(userId);
  if (!sockets) return;
  sockets.delete(ws);
  if (sockets.size === 0) clients.delete(userId);
}

function send(ws, payload) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function sendToUser(userId, payload) {
  for (const ws of clients.get(userId) ?? []) {
    send(ws, payload);
  }
}

function broadcastPresence() {
  const payload = { type: "presence", onlineUsers: Array.from(clients.keys()) };
  for (const sockets of clients.values()) {
    for (const ws of sockets) send(ws, payload);
  }
}

await app.prepare();
const handleUpgrade = app.getUpgradeHandler();

const server = http.createServer((req, res) => {
  handle(req, res);
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const isChatUpgrade = url.pathname === "/ws/messages" || url.pathname.startsWith("/websocket/");

  if (!isChatUpgrade) {
    handleUpgrade(req, socket, head);
    return;
  }

  const userId = url.pathname.startsWith("/websocket/")
    ? decodeURIComponent(url.pathname.split("/").pop() ?? "").trim()
    : url.searchParams.get("userId")?.trim();
  if (!userId) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req, userId);
  });
});

wss.on("connection", async (ws, _req, userId) => {
  addClient(userId, ws);
  send(ws, { type: "init", messages: await getMessagesForUser(userId), onlineUsers: Array.from(clients.keys()) });
  broadcastPresence();

  ws.on("message", async (raw) => {
    let event;
    try {
      event = JSON.parse(raw.toString());
    } catch {
      send(ws, { type: "error", code: "bad_json", message: "消息格式错误。" });
      return;
    }

    const isModernMessage = event.type === "send_message";
    const isLegacyMessage = event.type === "1";
    if (!isModernMessage && !isLegacyMessage) return;

    const receiverId = String(isLegacyMessage ? event.tarUser?.userId : event.receiverId ?? "").trim();
    const content = String(event.content ?? "").trim();
    const clientMsgId = String(event.clientMsgId ?? "").trim();
    const time = Number(event.time ?? Date.now());
    const data = await readPolicyData();
    const allowed = canSendMessage(data, userId, receiverId, content);

    if (!allowed.ok) {
      send(ws, { type: "error", code: allowed.code, message: allowed.message, level: allowed.level });
      return;
    }

    const { message, duplicated } = await appendMessage(userId, receiverId, content, { clientMsgId, time });
    const modernSenderPayload = { type: "message", message: toClientMessage(userId, message), level: allowed.level, duplicated };
    const modernReceiverPayload = { type: "message", message: toClientMessage(receiverId, message), level: allowed.level, duplicated };
    const legacyPayload = {
      type: "1",
      srcUser: { userId },
      tarUser: { userId: receiverId },
      content: message.content,
      time: message.msg_time,
      clientMsgId: message.client_msg_id
    };

    sendToUser(userId, isLegacyMessage ? legacyPayload : modernSenderPayload);
    sendToUser(receiverId, isLegacyMessage ? legacyPayload : modernReceiverPayload);
  });

  ws.on("close", () => {
    removeClient(userId, ws);
    broadcastPresence();
  });
});

server.listen(port, () => {
  console.log(`Local BBS ready on http://${hostname}:${port}`);
  console.log(`WebSocket endpoint ws://${hostname}:${port}/ws/messages?userId=admin`);
});
