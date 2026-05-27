import mysql, { type Pool, type PoolConnection, type QueryResult, type ResultSetHeader } from "mysql2/promise";

type QueryValue = string | number | boolean | Date | null;

declare global {
  var __bbsMysqlPool: Pool | undefined;
}

export function isDatabaseConfigured() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_PORT &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE
  );
}

export function getMysqlPool() {
  if (!isDatabaseConfigured()) {
    throw new Error("数据库服务未配置，请先配置 MySQL。");
  }

  if (!globalThis.__bbsMysqlPool) {
    globalThis.__bbsMysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 12,
      namedPlaceholders: false,
      charset: "utf8mb4"
    });
  }

  return globalThis.__bbsMysqlPool;
}

export async function queryRows<T = Record<string, unknown>>(sql: string, values: QueryValue[] = []) {
  const [rows] = await getMysqlPool().query(sql, values);
  return rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(sql: string, values: QueryValue[] = []) {
  const rows = await queryRows<T>(sql, values);
  return rows[0] ?? null;
}

export async function execute(sql: string, values: QueryValue[] = []) {
  const [result] = await getMysqlPool().execute<QueryResult>(sql, values);
  return result;
}

export async function executeResult(sql: string, values: QueryValue[] = []) {
  const result = await execute(sql, values);
  return result as ResultSetHeader;
}

export async function withTransaction<T>(task: (conn: PoolConnection) => Promise<T>) {
  const conn = await getMysqlPool().getConnection();
  try {
    await conn.beginTransaction();
    const value = await task(conn);
    await conn.commit();
    return value;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export function toJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  if (typeof value === "string" && value.length) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean);
      }
    } catch {
      return [];
    }
  }
  return [];
}
