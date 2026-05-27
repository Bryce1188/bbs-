"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

async function getSupabaseOrRedirect(path: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect(`${path}?error=supabase_not_configured`);
  return supabase;
}

async function getCurrentUserOrRedirect(path: string) {
  const supabase = await getSupabaseOrRedirect(path);
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) redirect(`/auth?next=${encodeURIComponent(path)}`);
  return { supabase, user };
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

const authSchema = z.object({
  account: z.string().email(),
  password: z.string().min(6)
});

export async function signInAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    account: text(formData.get("account")),
    password: text(formData.get("password"))
  });
  if (!parsed.success) redirect("/auth?error=invalid_credentials");
  const next = safeNextPath(text(formData.get("next")) || "/");

  const supabase = await getSupabaseOrRedirect("/auth");
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.account,
    password: parsed.data.password
  });

  if (error) redirect("/auth?error=invalid_credentials");
  redirect(next);
}

export async function signUpAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    account: text(formData.get("account")),
    password: text(formData.get("password"))
  });
  if (!parsed.success) {
    const errors = parsed.error.format();
    if (errors.password) {
      redirect("/auth?error=weak_password&tab=signup");
    }
    if (errors.account) {
      redirect("/auth?error=invalid_email&tab=signup");
    }
    redirect("/auth?error=invalid_credentials&tab=signup");
  }

  const supabase = await getSupabaseOrRedirect("/auth");
  const { error } = await supabase.rpc("register_confirmed_user", {
    user_email: parsed.data.account.trim().toLowerCase(),
    user_password: parsed.data.password
  });

  if (error) {
    const msg = error.message || "";
    if (msg.includes("user_already_exists")) {
      redirect("/auth?error=user_already_exists&tab=signup");
    } else if (msg.includes("invalid_email")) {
      redirect("/auth?error=invalid_email&tab=signup");
    } else if (msg.includes("weak_password")) {
      redirect("/auth?error=weak_password&tab=signup");
    }
    redirect("/auth?error=sign_up_failed&tab=signup");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.account.trim().toLowerCase(),
    password: parsed.data.password
  });

  if (signInError) redirect("/auth?created=1");
  redirect("/");
}

const passwordResetRequestSchema = z.object({
  account: z.string().email()
});

export async function requestPasswordResetAction(formData: FormData) {
  const parsed = passwordResetRequestSchema.safeParse({
    account: text(formData.get("account"))
  });
  if (!parsed.success) redirect("/auth/reset?error=invalid_email");

  const supabase = await getSupabaseOrRedirect("/auth/reset");
  const origin = await getRequestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.account, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset`
  });

  if (error) redirect("/auth/reset?error=reset_failed");
  redirect("/auth/reset?sent=1");
}

const passwordUpdateSchema = z.object({
  password: z.string().min(6).max(128),
  confirmPassword: z.string().min(6).max(128)
});

export async function updatePasswordAction(formData: FormData) {
  const parsed = passwordUpdateSchema.safeParse({
    password: text(formData.get("password")),
    confirmPassword: text(formData.get("confirmPassword"))
  });
  if (!parsed.success || parsed.data.password !== parsed.data.confirmPassword) {
    redirect("/auth/reset?error=password_mismatch");
  }

  const { supabase } = await getCurrentUserOrRedirect("/auth/reset");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) redirect("/auth/reset?error=update_failed");
  redirect("/auth?reset=1");
}

const postSchema = z.object({
  boardId: z.coerce.number().int().positive(),
  title: z.string().min(4).max(120),
  content: z.string().min(10).max(12000),
  tags: z.string().max(160).optional()
});

export async function createPostAction(formData: FormData) {
  const parsed = postSchema.safeParse({
    boardId: formData.get("boardId"),
    title: text(formData.get("title")),
    content: text(formData.get("content")),
    tags: text(formData.get("tags"))
  });
  if (!parsed.success) redirect("/publish?error=invalid_post");

  const { supabase } = await getCurrentUserOrRedirect("/publish");
  const tags = (parsed.data.tags ?? "")
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);

  const { data, error } = await supabase.rpc("create_post", {
    target_board_id: parsed.data.boardId,
    post_title: parsed.data.title,
    post_content: parsed.data.content,
    post_tags: tags
  });

  if (error || !data) redirect("/publish?error=create_failed");
  revalidatePath("/");
  revalidatePath("/boards");
  redirect(`/posts/${data}`);
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
  const { supabase } = await getCurrentUserOrRedirect(path);
  const { error } = await supabase.rpc("create_reply", {
    target_post_id: parsed.data.postId,
    reply_content: parsed.data.content
  });

  if (error) redirect(`${path}?error=reply_failed`);
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
  const { supabase } = await getCurrentUserOrRedirect(path);
  const { data, error } = await supabase.rpc("toggle_post_reaction", {
    target_post_id: parsed.data.postId,
    target_reaction: "like"
  });

  if (error) redirect(`${path}?error=like_failed`);
  revalidatePath(path);
  redirect(`${path}?notice=${data ? "like_added" : "like_removed"}`);
}

export async function toggleBookmarkAction(formData: FormData) {
  const parsed = postInteractionSchema.safeParse({ postId: formData.get("postId") });
  if (!parsed.success) redirect("/");

  const path = `/posts/${parsed.data.postId}`;
  const { supabase } = await getCurrentUserOrRedirect(path);
  const { data, error } = await supabase.rpc("toggle_bookmark", {
    target_post_id: parsed.data.postId
  });

  if (error) redirect(`${path}?error=bookmark_failed`);
  revalidatePath(path);
  redirect(`${path}?notice=${data ? "bookmark_added" : "bookmark_removed"}`);
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
  const { supabase, user } = await getCurrentUserOrRedirect(path);
  const { error } = await supabase.from("reports").insert({
    post_id: parsed.data.postId,
    reporter_id: user.id,
    reason: parsed.data.reason
  });

  if (error) redirect(`${path}?error=report_failed`);
  revalidatePath("/admin/reports");
  redirect(`${path}?notice=report_submitted`);
}

const messageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000)
});

export async function sendMessageAction(formData: FormData) {
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

  const { supabase, user } = await getCurrentUserOrRedirect("/messages");
  const { error } = await supabase.from("private_messages").insert({
    sender_id: user.id,
    receiver_id: parsed.data.receiverId,
    content: parsed.data.content
  });

  if (error) {
    const params = new URLSearchParams({
      peer: parsed.data.receiverId,
      error: "send_failed"
    });
    params.set("draft", parsed.data.content.slice(0, 500));
    redirect(`/messages?${params.toString()}`);
  }
  revalidatePath("/messages");
  redirect(`/messages?peer=${parsed.data.receiverId}&notice=message_sent`);
}

export async function markAllNotificationsReadAction() {
  const { supabase, user } = await getCurrentUserOrRedirect("/notifications");
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
  if (error) redirect("/notifications?error=mark_failed");
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

  const supabase = await getSupabaseOrRedirect("/admin/boards");
  const { error } = await supabase
    .from("boards")
    .update({
      name: parsed.data.name,
      group_name: parsed.data.group,
      description: parsed.data.description,
      icon: parsed.data.icon,
      theme_color: parsed.data.themeColor,
      sort_order: parsed.data.sortOrder
    })
    .eq("id", parsed.data.boardId);
  if (error) redirect("/admin/boards?error=update_failed");
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
  await requireAdminAccess();
  const rawBoardId = text(formData.get("boardId"));
  const boardIdValue = rawBoardId === "all" ? "" : rawBoardId;
  const parsed = noticeSchema.safeParse({
    title: text(formData.get("title")),
    content: text(formData.get("content")),
    boardId: boardIdValue ? boardIdValue : undefined
  });
  if (!parsed.success) redirect("/admin/notices?error=invalid_notice");

  const supabase = await getSupabaseOrRedirect("/admin/notices");
  const { error } = await supabase.from("notices").insert({
    title: parsed.data.title,
    content: parsed.data.content,
    board_id: parsed.data.boardId ?? null
  });
  if (error) redirect("/admin/notices?error=create_failed");
  revalidatePath("/admin/notices");
  redirect("/admin/notices");
}

export async function updateReportStatusAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = z
    .object({
      reportId: z.coerce.number().int().positive(),
      status: z.enum(["pending", "resolved", "rejected"])
    })
    .safeParse({ reportId: formData.get("reportId"), status: text(formData.get("status")) });
  if (!parsed.success) redirect("/admin/reports?error=invalid_report");

  const supabase = await getSupabaseOrRedirect("/admin/reports");
  const { error } = await supabase
    .from("reports")
    .update({ status: parsed.data.status, resolved_at: parsed.data.status === "pending" ? null : new Date().toISOString() })
    .eq("id", parsed.data.reportId);
  if (error) redirect("/admin/reports?error=update_failed");
  revalidatePath("/admin/reports");
  redirect("/admin/reports");
}

export async function toggleReplyVisibilityAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = z
    .object({ replyId: z.coerce.number().int().positive(), visible: z.enum(["true", "false"]) })
    .safeParse({ replyId: formData.get("replyId"), visible: text(formData.get("visible")) });
  if (!parsed.success) redirect("/admin/comments?error=invalid_reply");

  const supabase = await getSupabaseOrRedirect("/admin/comments");
  const { error } = await supabase.from("post_replies").update({ is_visible: parsed.data.visible === "true" }).eq("id", parsed.data.replyId);
  if (error) redirect("/admin/comments?error=update_failed");
  revalidatePath("/admin/comments");
  redirect("/admin/comments");
}

export async function updatePostStatusAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = z
    .object({
      postId: z.coerce.number().int().positive(),
      status: z.enum(["featured", "pinned", "normal"])
    })
    .safeParse({ postId: formData.get("postId"), status: text(formData.get("status")) });
  if (!parsed.success) redirect("/admin/posts?error=invalid_post");

  const supabase = await getSupabaseOrRedirect("/admin/posts");
  const { error } = await supabase.from("posts").update({ status: parsed.data.status, updated_at: new Date().toISOString() }).eq("id", parsed.data.postId);
  if (error) redirect("/admin/posts?error=update_failed");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function assignUserRoleAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = z
    .object({
      userId: z.string().uuid(),
      role: z.enum(["admin", "moderator", "member"])
    })
    .safeParse({ userId: text(formData.get("userId")), role: text(formData.get("role")) });
  if (!parsed.success) redirect("/admin/users?error=invalid_role");

  const supabase = await getSupabaseOrRedirect("/admin/users");
  const { error } = await supabase.from("profiles").update({ role: parsed.data.role }).eq("id", parsed.data.userId);
  if (error) redirect("/admin/users?error=role_failed");
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

const roleSchema = z.object({
  code: z.string().min(2).max(40).regex(/^[a-z][a-z0-9_-]*$/),
  name: z.string().min(1).max(80),
  description: z.string().max(300)
});

export async function createRoleAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = roleSchema.safeParse({
    code: text(formData.get("code")),
    name: text(formData.get("name")),
    description: text(formData.get("description"))
  });
  if (!parsed.success) redirect("/admin/roles?error=invalid_role");

  const supabase = await getSupabaseOrRedirect("/admin/roles");
  const { error } = await supabase.from("roles").insert(parsed.data);
  if (error) redirect("/admin/roles?error=create_failed");
  revalidatePath("/admin/roles");
  redirect("/admin/roles");
}

export async function updateRoleAction(formData: FormData) {
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

  const supabase = await getSupabaseOrRedirect("/admin/roles");
  const { error } = await supabase
    .from("roles")
    .update({ code: parsed.data.code, name: parsed.data.name, description: parsed.data.description })
    .eq("id", parsed.data.roleId);
  if (error) redirect("/admin/roles?error=update_failed");
  revalidatePath("/admin/roles");
  redirect("/admin/roles");
}

export async function deleteRoleAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = z.object({ roleId: z.coerce.number().int().positive() }).safeParse({ roleId: formData.get("roleId") });
  if (!parsed.success) redirect("/admin/roles?error=invalid_role");

  const supabase = await getSupabaseOrRedirect("/admin/roles");
  const { count, error: countError } = await supabase
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role_id", parsed.data.roleId);
  if (countError) redirect("/admin/roles?error=delete_failed");
  if ((count ?? 0) > 0) redirect("/admin/roles?error=role_in_use");

  const { error } = await supabase.from("roles").delete().eq("id", parsed.data.roleId);
  if (error) redirect("/admin/roles?error=delete_failed");
  revalidatePath("/admin/roles");
  redirect("/admin/roles");
}

const friendRequestSchema = z.object({
  addresseeId: z.string().min(1)
});

export async function sendFriendRequestAction(formData: FormData) {
  const parsed = friendRequestSchema.safeParse({ addresseeId: text(formData.get("addresseeId")) });
  if (!parsed.success) redirect("/messages?error=invalid_friend");

  const { supabase, user } = await getCurrentUserOrRedirect("/messages");
  if (parsed.data.addresseeId === user.id) redirect("/messages?error=self_friend");

  const { error } = await supabase.from("friendships").upsert(
    {
      requester_id: user.id,
      addressee_id: parsed.data.addresseeId,
      status: "pending",
      updated_at: new Date().toISOString()
    },
    { onConflict: "requester_id,addressee_id" }
  );
  if (error) redirect("/messages?error=friend_failed");
  revalidatePath("/messages");
  redirect(`/messages?peer=${parsed.data.addresseeId}&notice=friend_requested`);
}

export async function respondFriendRequestAction(formData: FormData) {
  const parsed = z
    .object({
      friendshipId: z.coerce.number().int().positive(),
      status: z.enum(["accepted", "rejected"])
    })
    .safeParse({ friendshipId: formData.get("friendshipId"), status: text(formData.get("status")) });
  if (!parsed.success) redirect("/messages?error=invalid_friend");

  const { supabase, user } = await getCurrentUserOrRedirect("/messages");
  const { error } = await supabase
    .from("friendships")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.friendshipId)
    .eq("addressee_id", user.id);
  if (error) redirect("/messages?error=friend_failed");
  revalidatePath("/messages");
  redirect(`/messages?notice=friend_${parsed.data.status}`);
}
