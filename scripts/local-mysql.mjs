import nextEnv from "@next/env";
import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const MYSQL_BIN_DIR = process.env.LOCAL_MYSQL_BIN_DIR ?? "C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin";
const MYSQL_BASE_DIR = path.dirname(MYSQL_BIN_DIR);
const MYSQLD_PATH = path.join(MYSQL_BIN_DIR, "mysqld.exe");
const MYSQL_BASE = path.join(process.cwd(), ".local-mysql");
const MYSQL_DATA = path.join(MYSQL_BASE, "data");
const MYSQL_LOG = path.join(MYSQL_BASE, "mysql.log");
const MYSQL_PID = path.join(MYSQL_BASE, "mysql.pid");
const MYSQL_CONF = path.join(MYSQL_BASE, "my.ini");
const MYSQL_PORT = Number(process.env.LOCAL_DB_PORT ?? 3307);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, "127.0.0.1");
  });
}

async function hasInitializedDataDir() {
  try {
    const content = await readFile(path.join(MYSQL_DATA, "auto.cnf"), "utf8");
    return content.length > 0;
  } catch {
    return false;
  }
}

async function isProcessRunning(pid) {
  if (!pid || Number.isNaN(pid)) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function hasLivePidFile() {
  try {
    await access(MYSQL_PID);
    const pid = Number((await readFile(MYSQL_PID, "utf8")).trim());
    return await isProcessRunning(pid);
  } catch {
    return false;
  }
}

async function writeConfig() {
  await mkdir(MYSQL_BASE, { recursive: true });
  await writeFile(
    MYSQL_CONF,
    [
      "[mysqld]",
      `basedir=${MYSQL_BASE_DIR.replaceAll("\\", "/")}`,
      `datadir=${MYSQL_DATA.replaceAll("\\", "/")}`,
      `port=${MYSQL_PORT}`,
      "bind-address=127.0.0.1",
      `pid-file=${MYSQL_PID.replaceAll("\\", "/")}`,
      `log-error=${MYSQL_LOG.replaceAll("\\", "/")}`,
      "character-set-server=utf8mb4",
      "collation-server=utf8mb4_unicode_ci",
      "default-time-zone=+08:00",
      "skip-networking=0",
      "mysqlx=0",
      "max_connections=50",
      ""
    ].join("\n"),
    "utf8"
  );
}

async function initializeDataDir() {
  await mkdir(MYSQL_DATA, { recursive: true });
  await writeConfig();
  if (await hasInitializedDataDir()) return;

  await new Promise((resolve, reject) => {
    const child = spawn(
      MYSQLD_PATH,
      [`--defaults-file=${MYSQL_CONF}`, "--initialize-insecure", `--basedir=${MYSQL_BASE_DIR}`, `--datadir=${MYSQL_DATA}`],
      { windowsHide: true, stdio: "pipe" }
    );
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `mysqld --initialize-insecure failed with code ${code}`));
    });
  });
}

async function startServer() {
  await writeConfig();
  if (await hasLivePidFile()) return;
  const child = spawn(MYSQLD_PATH, [`--defaults-file=${MYSQL_CONF}`, "--console"], {
    detached: true,
    windowsHide: true,
    stdio: "ignore"
  });
  child.unref();
}

export async function ensureLocalMySql() {
  if (await isPortOpen(MYSQL_PORT)) return;
  await initializeDataDir();
  await startServer();

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await isPortOpen(MYSQL_PORT)) return;
    await sleep(1000);
  }

  throw new Error(`local mysql did not start on 127.0.0.1:${MYSQL_PORT}`);
}

export function localMysqlInfo() {
  return {
    port: MYSQL_PORT,
    dataDir: MYSQL_DATA,
    configFile: MYSQL_CONF
  };
}
