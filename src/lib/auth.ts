import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type RowDataPacket } from "mysql2/promise";
import { execute, executeResult, isDatabaseConfigured, queryOne, withTransaction } from "@/lib/mysql";

export const SESSION_COOKIE_NAME = "bbs_session";

type UserRole = "admin" | "moderator" | "member";

export type CurrentUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  levelName: string;
  points: number;
  signature: string;
};

type UserAuthRow = RowDataPacket & {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  display_name: string;
  role: UserRole;
  level_name: string;
  points: number;
  signature: string;
};

function getSessionHours() {
  const value = Number(process.env.SESSION_TTL_HOURS ?? 72);
  if (!Number.isFinite(value) || value <= 0) return 72;
  return value;
}

function mapCurrentUser(row: UserAuthRow): CurrentUser {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    levelName: row.level_name,
    points: row.points,
    signature: row.signature
  };
}

export async function createSession(userId: string) {
  const token = randomUUID();
  const ttl = getSessionHours();
  const expiresAt = new Date(Date.now() + ttl * 60 * 60 * 1000);

  await execute("insert into user_sessions (session_token, user_id, expires_at) values (?, ?, ?)", [token, userId, expiresAt]);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await execute("delete from user_sessions where session_token = ?", [token]);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isDatabaseConfigured()) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const row = await queryOne<UserAuthRow>(
    `
      select
        ua.id,
        ua.email,
        ua.password_hash,
        p.username,
        p.display_name,
        p.role,
        p.level_name,
        p.points,
        p.signature
      from user_sessions s
      join users_auth ua on ua.id = s.user_id
      join profiles p on p.id = ua.id
      where s.session_token = ?
        and s.expires_at > now()
      limit 1
    `,
    [token]
  );

  if (!row) {
    await execute("delete from user_sessions where session_token = ?", [token]);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return mapCurrentUser(row);
}

export async function requireUser(path: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(path)}`);
  }
  return user;
}

export async function signInWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const row = await queryOne<UserAuthRow>(
    `
      select
        ua.id,
        ua.email,
        ua.password_hash,
        p.username,
        p.display_name,
        p.role,
        p.level_name,
        p.points,
        p.signature
      from users_auth ua
      join profiles p on p.id = ua.id
      where ua.email = ?
      limit 1
    `,
    [normalizedEmail]
  );
  if (!row) return null;

  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;

  await createSession(row.id);
  return mapCurrentUser(row);
}

export async function registerUser(email: string, password: string, nickname: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedNickname = nickname.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
    throw new Error("invalid_email");
  }
  if (password.length < 6) {
    throw new Error("weak_password");
  }
  if (normalizedNickname.length < 2 || normalizedNickname.length > 24) {
    throw new Error("invalid_nickname");
  }

  const exists = await queryOne<RowDataPacket & { id: string }>("select id from users_auth where email = ? limit 1", [normalizedEmail]);
  if (exists) {
    throw new Error("user_already_exists");
  }

  const userId = randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const fallback = normalizedEmail.split("@")[0] || `user_${userId.slice(0, 8)}`;

  await withTransaction(async (conn) => {
    await conn.execute("insert into users_auth (id, email, password_hash, email_confirmed_at) values (?, ?, ?, now())", [
      userId,
      normalizedEmail,
      passwordHash
    ]);

    const [nameRows] = await conn.query<RowDataPacket[]>("select count(1) as total from profiles where username = ?", [fallback]);
    const taken = Number(nameRows[0]?.total ?? 0);
    const username = taken > 0 ? `${fallback}_${userId.slice(0, 8)}` : fallback;

    await conn.execute(
      `
        insert into profiles
          (id, username, display_name, avatar_path, role, level_name, points, signature)
        values
          (?, ?, ?, '/avatars/placeholder-user.svg', 'member', 'Lv.1 新人', 0, '')
      `,
      [userId, username, normalizedNickname]
    );

    const [roleRows] = await conn.query<RowDataPacket[]>("select id from roles where code = 'member' limit 1");
    const roleId = Number(roleRows[0]?.id ?? 0);
    if (roleId > 0) {
      await conn.execute("insert into user_roles (user_id, role_id) values (?, ?)", [userId, roleId]);
    }
  });

  await createSession(userId);
  return userId;
}

export async function updatePasswordByUserId(userId: string, newPassword: string) {
  const hash = await bcrypt.hash(newPassword, 10);
  await execute("update users_auth set password_hash = ?, updated_at = now() where id = ?", [hash, userId]);
}

export async function createPasswordResetToken(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await queryOne<RowDataPacket & { id: string }>("select id from users_auth where email = ? limit 1", [normalizedEmail]);
  if (!user) return null;

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await executeResult("insert into password_reset_tokens (token, user_id, expires_at) values (?, ?, ?)", [token, user.id, expiresAt]);
  return token;
}

export async function consumePasswordResetToken(token: string, newPassword: string) {
  const row = await queryOne<RowDataPacket & { user_id: string }>(
    "select user_id from password_reset_tokens where token = ? and expires_at > now() and used_at is null limit 1",
    [token]
  );
  if (!row) return false;

  await withTransaction(async (conn) => {
    const hash = await bcrypt.hash(newPassword, 10);
    await conn.execute("update users_auth set password_hash = ?, updated_at = now() where id = ?", [hash, row.user_id]);
    await conn.execute("update password_reset_tokens set used_at = now() where token = ?", [token]);
  });
  return true;
}
