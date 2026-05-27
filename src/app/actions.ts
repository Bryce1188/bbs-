"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { consumePasswordResetToken, createPasswordResetToken, registerUser, requireUser, signInWithPassword, updatePasswordByUserId } from "@/lib/auth";
import { requireAdminAccess } from "@/lib/admin";
import { emitToUser } from "@/lib/realtime/server";
import { execute, isDatabaseConfigured, queryOne, withTransaction } from "@/lib/mysql";

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function safeNextPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return process.env.NEXT_PUBLIC_SITE_URL ?? (host ? `${protocol}://${host}` : "http://localhost:3000");
}

function requireDatabase(path: string) {
  if (!isDatabaseConfigured()) {
    redirect(`${path}?error=db_not_configured`);
  }
}

const signInSchema = z.object({
  account: z.string().email(),
  password: z.string().min(6)
});

const signUpSchema = z.object({
  account: z.string().email(),
  password: z.string().min(6),
  nickname: z.string().min(2).max(24)
});

export async function signInAction(formData: FormData) {
  requireDatabase("/auth");
  const parsed = signInSchema.safeParse({
    account: text(formData.get("account")),
    password: text(formData.get("password"))
  });
  if (!parsed.success) redirect("/auth?error=invalid_credentials");
  const next = safeNextPath(text(formData.get("next")) || "/");

  const user = await signInWithPassword(parsed.data.account, parsed.data.password);
  if (!user) redirect("/auth?error=invalid_credentials");
  redirect(next);
}

export async function signUpAction(formData: FormData) {
  requireDatabase("/auth");
  const parsed = signUpSchema.safeParse({
    account: text(formData.get("account")),
    password: text(formData.get("password")),
    nickname: text(formData.get("nickname"))
  });
  if (!parsed.success) {
    const errors = parsed.error.format();
    if (errors.password) redirect("/auth?error=weak_password&tab=signup");
    if (errors.account) redirect("/auth?error=invalid_email&tab=signup");
    if (errors.nickname) redirect("/auth?error=invalid_nickname&tab=signup");
    redirect("/auth?error=invalid_credentials&tab=signup");
  }

  try {
    await registerUser(parsed.data.account, parsed.data.password, parsed.data.nickname);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("user_already_exists")) redirect("/auth?error=user_already_exists&tab=signup");
    if (message.includes("invalid_email")) redirect("/auth?error=invalid_email&tab=signup");
    if (message.includes("weak_password")) redirect("/auth?error=weak_password&tab=signup");
    if (message.includes("invalid_nickname")) redirect("/auth?error=invalid_nickname&tab=signup");
    redirect("/auth?error=sign_up_failed&tab=signup");
  }
  redirect("/");
}

const passwordResetRequestSchema = z.object({
  account: z.string().email()
});

export async function requestPasswordResetAction(formData: FormData) {
  requireDatabase("/auth/reset");
  const parsed = passwordResetRequestSchema.safeParse({
    account: text(formData.get("account"))
  });
  if (!parsed.success) redirect("/auth/reset?error=invalid_email");

  const token = await createPasswordResetToken(parsed.data.account);
  if (token) {
    const origin = await getRequestOrigin();
    console.info(`密码重置链接: ${origin}/auth/callback?next=/auth/reset&token=${token}`);
  }
  redirect("/auth/reset?sent=1");
}

const passwordUpdateSchema = z.object({
  password: z.string().min(6).max(128),
  confirmPassword: z.string().min(6).max(128),
  token: z.string().optional()
});

export async function updatePasswordAction(formData: FormData) {
  requireDatabase("/auth/reset");
  const parsed = passwordUpdateSchema.safeParse({
    password: text(formData.get("password")),
    confirmPassword: text(formData.get("confirmPassword")),
    token: text(formData.get("token")) || undefined
  });
  if (!parsed.success || parsed.data.password !== parsed.data.confirmPassword) {
    redirect("/auth/reset?error=password_mismatch");
  }

  const token = parsed.data.token?.trim();
  if (token) {
    const ok = await consumePasswordResetToken(token, parsed.data.password);
    if (!ok) redirect("/auth/reset?error=update_failed");
    redirect("/auth?reset=1");
  }

  const user = await requireUser("/auth/reset");
  await updatePasswordByUserId(user.id, parsed.data.password);
  redirect("/auth?reset=1");
}

const postSchema = z.object({
  boardId: z.coerce.number().int().positive(),
  title: z.string().min(4).max(120),
  content: z.string().min(10).max(12000),
  tags: z.string().max(160).optional()
});

export async function createPostAction(formData: FormData) {
  requireDatabase("/publish");
  const parsed = postSchema.safeParse({
    boardId: formData.get("boardId"),
    title: text(formData.get("title")),
    content: text(formData.get("content")),
    tags: text(formData.get("tags"))
  });
  if (!parsed.success) redirect("/publish?error=invalid_post");

  const user = await requireUser("/publish");
  const tags = (parsed.data.tags ?? "")
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);

  const postId = await withTransaction(async (conn) => {
    const [result] = await conn.execute(
      `
        insert into posts (board_id, author_id, title, excerpt, content, tags, status)
        values (?, ?, ?, ?, ?, ?, 'normal')
      `,
      [
        parsed.data.boardId,
        user.id,
        parsed.data.title,
        parsed.data.content.replace(/\s+/g, " ").slice(0, 180),
        parsed.data.content,
        JSON.stringify(tags)
      ]
    );
    const insertedId = Number((result as { insertId: number }).insertId);
    await conn.execute("update boards set post_count = post_count + 1, today_count = today_count + 1 where id = ?", [parsed.data.boardId]);
    await conn.execute("insert into audit_logs (actor_id, action, target_type, target_id) values (?, 'create_post', 'post', ?)", [user.id, String(insertedId)]);
    return insertedId;
  });

  revalidatePath("/");
  revalidatePath("/boards");
  redirect(`/posts/${postId}`);
}

const replySchema = z.object({
  postId: z.coerce.number().int().positive(),
  content: z.string().min(2).max(4000)
});

export async function createReplyAction(formData: FormData) {
  const parsed = replySchema.safeParse({
    postId: formData.get("postId"),
    content: text(formData.get("content"))
  });
  if (!parsed.success) redirect("/");

  const path = `/posts/${parsed.data.postId}`;
  requireDatabase(path);
  const user = await requireUser(path);

  const postAuthor = await withTransaction(async (conn) => {
    const [seatRowsRaw] = await conn.query("select coalesce(max(seat),0) + 1 as nextSeat from post_replies where post_id = ?", [parsed.data.postId]);
    const seatRows = seatRowsRaw as Array<{ nextSeat: number }>;
    const seat = Number(seatRows[0]?.nextSeat ?? 1);

    await conn.execute("insert into post_replies (post_id, author_id, content, seat, is_visible) values (?, ?, ?, ?, 1)", [
      parsed.data.postId,
      user.id,
      parsed.data.content,
      seat
    ]);
    await conn.execute("update posts set reply_count = reply_count + 1, updated_at = now() where id = ?", [parsed.data.postId]);
    await conn.execute("insert into audit_logs (actor_id, action, target_type, target_id) values (?, 'create_reply', 'post', ?)", [
      user.id,
      String(parsed.data.postId)
    ]);
    const [postRowsRaw] = await conn.query("select author_id from posts where id = ? limit 1", [parsed.data.postId]);
    const postRows = postRowsRaw as Array<{ author_id: string | null }>;
    return postRows[0]?.author_id ?? null;
  });

  if (postAuthor && postAuthor !== user.id) {
    await execute(
      "insert into notifications (user_id, type, title, description, is_read) values (?, 'reply', '你的帖子有新回复', ?, 0)",
      [postAuthor, `帖子 #${parsed.data.postId} 收到新的回复。`]
    );
    emitToUser(postAuthor, "notification:new", { type: "reply", postId: parsed.data.postId });
  }

  revalidatePath(path);
  redirect(`${path}?notice=reply_created`);
}

const postInteractionSchema = z.object({
  postId: z.coerce.number().int().positive()
});

export async function togglePostLikeAction(formData: FormData) {
  const parsed = postInteractionSchema.safeParse({ postId: formData.get("postId") });
  if (!parsed.success) redirect("/");
  const path = `/posts/${parsed.data.postId}`;
  requireDatabase(path);
  const user = await requireUser(path);

  let added = false;
  await withTransaction(async (conn) => {
    const [rowsRaw] = await conn.query(
      "select id from post_reactions where post_id = ? and user_id = ? and reaction = 'like' limit 1",
      [parsed.data.postId, user.id]
    );
    const rows = rowsRaw as Array<{ id: number }>;
    if (rows[0]?.id) {
      await conn.execute("delete from post_reactions where id = ?", [rows[0].id]);
      await conn.execute("update posts set like_count = greatest(like_count - 1, 0) where id = ?", [parsed.data.postId]);
      added = false;
      return;
    }
    await conn.execute("insert into post_reactions (post_id, user_id, reaction) values (?, ?, 'like')", [parsed.data.postId, user.id]);
    await conn.execute("update posts set like_count = like_count + 1 where id = ?", [parsed.data.postId]);
    added = true;
  });

  revalidatePath(path);
  redirect(`${path}?notice=${added ? "like_added" : "like_removed"}`);
}

export async function toggleBookmarkAction(formData: FormData) {
  const parsed = postInteractionSchema.safeParse({ postId: formData.get("postId") });
  if (!parsed.success) redirect("/");
  const path = `/posts/${parsed.data.postId}`;
  requireDatabase(path);
  const user = await requireUser(path);

  let added = false;
  await withTransaction(async (conn) => {
    const [rowsRaw] = await conn.query("select id from bookmarks where post_id = ? and user_id = ? limit 1", [parsed.data.postId, user.id]);
    const rows = rowsRaw as Array<{ id: number }>;
    if (rows[0]?.id) {
      await conn.execute("delete from bookmarks where id = ?", [rows[0].id]);
      await conn.execute("update posts set collect_count = greatest(collect_count - 1, 0) where id = ?", [parsed.data.postId]);
      added = false;
      return;
    }
    await conn.execute("insert into bookmarks (post_id, user_id) values (?, ?)", [parsed.data.postId, user.id]);
    await conn.execute("update posts set collect_count = collect_count + 1 where id = ?", [parsed.data.postId]);
    added = true;
  });

  revalidatePath(path);
  redirect(`${path}?notice=${added ? "bookmark_added" : "bookmark_removed"}`);
}

const reportSchema = z.object({
  postId: z.coerce.number().int().positive(),
  reason: z.string().min(4).max(300)
});

export async function createReportAction(formData: FormData) {
  const parsed = reportSchema.safeParse({
    postId: formData.get("postId"),
    reason: text(formData.get("reason"))
  });
  if (!parsed.success) redirect("/");

  const path = `/posts/${parsed.data.postId}`;
  requireDatabase(path);
  const user = await requireUser(path);

  await execute("insert into reports (reporter_id, post_id, reason, status) values (?, ?, ?, 'pending')", [user.id, parsed.data.postId, parsed.data.reason]);
  revalidatePath("/admin/reports");
  redirect(`${path}?notice=report_submitted`);
}

const messageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000)
});

export async function sendMessageAction(formData: FormData) {
  requireDatabase("/messages");
  const receiverIdRaw = text(formData.get("receiverId"));
  const contentRaw = text(formData.get("content"));
  const parsed = messageSchema.safeParse({
    receiverId: receiverIdRaw,
    content: contentRaw
  });
  if (!parsed.success) {
    const params = new URLSearchParams();
    params.set("error", "invalid_message");
    if (receiverIdRaw) params.set("peer", receiverIdRaw);
    if (contentRaw) params.set("draft", contentRaw.slice(0, 500));
    redirect(`/messages?${params.toString()}`);
  }

  const user = await requireUser("/messages");
  await withTransaction(async (conn) => {
    await conn.execute("insert into private_messages (sender_id, receiver_id, content, is_read) values (?, ?, ?, 0)", [
      user.id,
      parsed.data.receiverId,
      parsed.data.content
    ]);
    await conn.execute("insert into notifications (user_id, type, title, description, is_read) values (?, 'system', '你有一条新私信', ?, 0)", [
      parsed.data.receiverId,
      `${user.displayName} 给你发送了一条私信。`
    ]);
  });

  emitToUser(parsed.data.receiverId, "message:new", { from: user.id });
  emitToUser(parsed.data.receiverId, "notification:new", { type: "system" });
  revalidatePath("/messages");
  redirect(`/messages?peer=${parsed.data.receiverId}&notice=message_sent`);
}

export async function markAllNotificationsReadAction() {
  requireDatabase("/notifications");
  const user = await requireUser("/notifications");
  await execute("update notifications set is_read = 1 where user_id = ? and is_read = 0", [user.id]);
  emitToUser(user.id, "notification:read", {});
  revalidatePath("/notifications");
  redirect("/notifications?notice=all_read");
}

const boardAdminSchema = z.object({
  boardId: z.coerce.number().int().positive(),
  name: z.string().min(1).max(80),
  group: z.string().min(1).max(80),
  description: z.string().max(400),
  icon: z.string().min(1).max(80),
  themeColor: z.string().min(1).max(40),
  sortOrder: z.coerce.number().int().min(0).max(9999)
});

export async function updateBoardAction(formData: FormData) {
  requireDatabase("/admin/boards");
  await requireAdminAccess();
  const parsed = boardAdminSchema.safeParse({
    boardId: formData.get("boardId"),
    name: text(formData.get("name")),
    group: text(formData.get("group")),
    description: text(formData.get("description")),
    icon: text(formData.get("icon")),
    themeColor: text(formData.get("themeColor")),
    sortOrder: formData.get("sortOrder")
  });
  if (!parsed.success) redirect("/admin/boards?error=invalid_board");

  await execute(
    `
      update boards
      set name = ?, group_name = ?, description = ?, icon = ?, theme_color = ?, sort_order = ?, updated_at = now()
      where id = ?
    `,
    [parsed.data.name, parsed.data.group, parsed.data.description, parsed.data.icon, parsed.data.themeColor, parsed.data.sortOrder, parsed.data.boardId]
  );
  revalidatePath("/admin/boards");
  revalidatePath("/boards");
  redirect("/admin/boards");
}

const noticeSchema = z.object({
  title: z.string().min(2).max(120),
  content: z.string().min(4).max(4000),
  boardId: z.coerce.number().int().positive().optional()
});

export async function createNoticeAction(formData: FormData) {
  requireDatabase("/admin/notices");
  await requireAdminAccess();
  const rawBoardId = text(formData.get("boardId"));
  const boardIdValue = rawBoardId === "all" ? "" : rawBoardId;
  const parsed = noticeSchema.safeParse({
    title: text(formData.get("title")),
    content: text(formData.get("content")),
    boardId: boardIdValue ? boardIdValue : undefined
  });
  if (!parsed.success) redirect("/admin/notices?error=invalid_notice");

  await execute("insert into notices (title, content, board_id, is_active) values (?, ?, ?, 1)", [
    parsed.data.title,
    parsed.data.content,
    parsed.data.boardId ?? null
  ]);
  revalidatePath("/admin/notices");
  redirect("/admin/notices");
}

export async function updateReportStatusAction(formData: FormData) {
  requireDatabase("/admin/reports");
  await requireAdminAccess();
  const parsed = z
    .object({
      reportId: z.coerce.number().int().positive(),
      status: z.enum(["pending", "resolved", "rejected"])
    })
    .safeParse({ reportId: formData.get("reportId"), status: text(formData.get("status")) });
  if (!parsed.success) redirect("/admin/reports?error=invalid_report");

  await execute("update reports set status = ?, resolved_at = if(? = 'pending', null, now()) where id = ?", [
    parsed.data.status,
    parsed.data.status,
    parsed.data.reportId
  ]);
  revalidatePath("/admin/reports");
  redirect("/admin/reports");
}

export async function toggleReplyVisibilityAction(formData: FormData) {
  requireDatabase("/admin/comments");
  await requireAdminAccess();
  const parsed = z
    .object({ replyId: z.coerce.number().int().positive(), visible: z.enum(["true", "false"]) })
    .safeParse({ replyId: formData.get("replyId"), visible: text(formData.get("visible")) });
  if (!parsed.success) redirect("/admin/comments?error=invalid_reply");

  await execute("update post_replies set is_visible = ? where id = ?", [parsed.data.visible === "true" ? 1 : 0, parsed.data.replyId]);
  revalidatePath("/admin/comments");
  redirect("/admin/comments");
}

export async function updatePostStatusAction(formData: FormData) {
  requireDatabase("/admin/posts");
  await requireAdminAccess();
  const parsed = z
    .object({
      postId: z.coerce.number().int().positive(),
      status: z.enum(["featured", "pinned", "normal"])
    })
    .safeParse({ postId: formData.get("postId"), status: text(formData.get("status")) });
  if (!parsed.success) redirect("/admin/posts?error=invalid_post");

  await execute("update posts set status = ?, updated_at = now() where id = ?", [parsed.data.status, parsed.data.postId]);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function assignUserRoleAction(formData: FormData) {
  requireDatabase("/admin/users");
  await requireAdminAccess();
  const parsed = z
    .object({
      userId: z.string().uuid(),
      role: z.enum(["admin", "moderator", "member"])
    })
    .safeParse({ userId: text(formData.get("userId")), role: text(formData.get("role")) });
  if (!parsed.success) redirect("/admin/users?error=invalid_role");

  await withTransaction(async (conn) => {
    await conn.execute("update profiles set role = ?, updated_at = now() where id = ?", [parsed.data.role, parsed.data.userId]);
    await conn.execute("delete ur from user_roles ur join roles r on r.id = ur.role_id where ur.user_id = ? and r.code in ('admin','moderator','member')", [
      parsed.data.userId
    ]);
    const [roleRowsRaw] = await conn.query("select id from roles where code = ? limit 1", [parsed.data.role]);
    const roleRows = roleRowsRaw as Array<{ id: number }>;
    const roleId = Number(roleRows[0]?.id ?? 0);
    if (roleId > 0) {
      await conn.execute("insert into user_roles (user_id, role_id) values (?, ?)", [parsed.data.userId, roleId]);
    }
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

const roleSchema = z.object({
  code: z.string().min(2).max(40).regex(/^[a-z][a-z0-9_-]*$/),
  name: z.string().min(1).max(80),
  description: z.string().max(300)
});

export async function createRoleAction(formData: FormData) {
  requireDatabase("/admin/roles");
  await requireAdminAccess();
  const parsed = roleSchema.safeParse({
    code: text(formData.get("code")),
    name: text(formData.get("name")),
    description: text(formData.get("description"))
  });
  if (!parsed.success) redirect("/admin/roles?error=invalid_role");

  await execute("insert into roles (code, name, description) values (?, ?, ?)", [parsed.data.code, parsed.data.name, parsed.data.description]);
  revalidatePath("/admin/roles");
  redirect("/admin/roles");
}

export async function updateRoleAction(formData: FormData) {
  requireDatabase("/admin/roles");
  await requireAdminAccess();
  const parsed = roleSchema
    .extend({ roleId: z.coerce.number().int().positive() })
    .safeParse({
      roleId: formData.get("roleId"),
      code: text(formData.get("code")),
      name: text(formData.get("name")),
      description: text(formData.get("description"))
    });
  if (!parsed.success) redirect("/admin/roles?error=invalid_role");

  await execute("update roles set code = ?, name = ?, description = ?, updated_at = now() where id = ?", [
    parsed.data.code,
    parsed.data.name,
    parsed.data.description,
    parsed.data.roleId
  ]);
  revalidatePath("/admin/roles");
  redirect("/admin/roles");
}

export async function deleteRoleAction(formData: FormData) {
  requireDatabase("/admin/roles");
  await requireAdminAccess();
  const parsed = z.object({ roleId: z.coerce.number().int().positive() }).safeParse({ roleId: formData.get("roleId") });
  if (!parsed.success) redirect("/admin/roles?error=invalid_role");

  const countRow = await queryOne<{ total: number }>("select count(*) as total from user_roles where role_id = ?", [parsed.data.roleId]);
  if (Number(countRow?.total ?? 0) > 0) redirect("/admin/roles?error=role_in_use");

  await execute("delete from roles where id = ?", [parsed.data.roleId]);
  revalidatePath("/admin/roles");
  redirect("/admin/roles");
}

const friendRequestSchema = z.object({
  addresseeId: z.string().min(1)
});

export async function sendFriendRequestAction(formData: FormData) {
  requireDatabase("/messages");
  const parsed = friendRequestSchema.safeParse({ addresseeId: text(formData.get("addresseeId")) });
  if (!parsed.success) redirect("/messages?error=invalid_friend");

  const user = await requireUser("/messages");
  if (parsed.data.addresseeId === user.id) redirect("/messages?error=self_friend");

  await execute(
    `
      insert into friendships (requester_id, addressee_id, status)
      values (?, ?, 'pending')
      on duplicate key update status = values(status), updated_at = now()
    `,
    [user.id, parsed.data.addresseeId]
  );

  await execute("insert into notifications (user_id, type, title, description, is_read) values (?, 'friend', '新的好友申请', ?, 0)", [
    parsed.data.addresseeId,
    `${user.displayName} 向你发送了好友申请。`
  ]);
  emitToUser(parsed.data.addresseeId, "notification:new", { type: "friend" });

  revalidatePath("/messages");
  redirect(`/messages?peer=${parsed.data.addresseeId}&notice=friend_requested`);
}

export async function respondFriendRequestAction(formData: FormData) {
  requireDatabase("/messages");
  const parsed = z
    .object({
      friendshipId: z.coerce.number().int().positive(),
      status: z.enum(["accepted", "rejected"])
    })
    .safeParse({ friendshipId: formData.get("friendshipId"), status: text(formData.get("status")) });
  if (!parsed.success) redirect("/messages?error=invalid_friend");

  const user = await requireUser("/messages");
  await execute("update friendships set status = ?, updated_at = now() where id = ? and addressee_id = ?", [
    parsed.data.status,
    parsed.data.friendshipId,
    user.id
  ]);

  const noticeTitle = parsed.data.status === "accepted" ? "好友申请已通过" : "好友申请被拒绝";
  await execute("insert into notifications (user_id, type, title, description, is_read) values ((select requester_id from friendships where id = ?), 'friend', ?, ?, 0)", [
    parsed.data.friendshipId,
    noticeTitle,
    `${user.displayName} ${parsed.data.status === "accepted" ? "通过" : "拒绝"}了你的好友申请。`
  ]);

  const requester = await queryOne<{ requester_id: string }>("select requester_id from friendships where id = ? limit 1", [parsed.data.friendshipId]);
  if (requester?.requester_id) {
    emitToUser(requester.requester_id, "notification:new", { type: "friend" });
  }

  revalidatePath("/messages");
  redirect(`/messages?notice=friend_${parsed.data.status}`);
}
