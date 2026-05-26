import nextEnv from "@next/env";
import { ensureLocalMySql } from "./local-mysql.mjs";
import { initLocalDb } from "./init-local-db.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

await ensureLocalMySql();
await initLocalDb();
await import("../server.mjs");
