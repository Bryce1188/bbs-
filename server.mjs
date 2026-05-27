import http from "node:http";
import next from "next";
import mysql from "mysql2/promise";
import { Server as SocketIOServer } from "socket.io";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.local" });
loadDotenv();

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let pool = null;

function createPoolIfConfigured() {
  if (!process.env.MYSQL_HOST || !process.env.MYSQL_PORT || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
    return null;
  }
  return mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4"
  });
}

function parseCookies(rawCookie = "") {
  const out = {};
  for (const pair of rawCookie.split(";")) {
    const [k, ...rest] = pair.trim().split("=");
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join("=") || "");
  }
  return out;
}

app.prepare().then(() => {
  if (!pool) {
    pool = createPoolIfConfigured();
  }

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(server, {
    path: "/socket.io",
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.use(async (socket, nextAuth) => {
    try {
      if (!pool) {
        pool = createPoolIfConfigured();
      }
      if (!pool) return nextAuth(new Error("db_not_configured"));
      const cookies = parseCookies(socket.handshake.headers.cookie || "");
      const token = cookies.bbs_session;
      if (!token) return nextAuth(new Error("unauthorized"));

      const [rows] = await pool.query(
        `
          select s.user_id
          from user_sessions s
          where s.session_token = ?
            and s.expires_at > now()
          limit 1
        `,
        [token]
      );
      const userId = rows?.[0]?.user_id;
      if (!userId) return nextAuth(new Error("unauthorized"));
      socket.data.userId = userId;
      return nextAuth();
    } catch (error) {
      return nextAuth(error);
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  globalThis.__bbsIo = io;

  server
    .once("error", (error) => {
      console.error(error);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      if (!pool) {
        console.warn("> MySQL 未配置，当前只能使用演示数据。");
      }
    });
});
