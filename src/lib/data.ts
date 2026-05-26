import { replies, stats } from "@/lib/mock-data";
import {
  getCurrentLocalUserId,
  getLocalAdminProfiles,
  getLocalAuditLogs,
  getLocalBoardPosts,
  getLocalBoards,
  getLocalFriendships,
  getLocalHomeStats,
  getLocalMessages,
  getLocalNotifications,
  getLocalNotices,
  getLocalPost,
  getLocalPosts,
  getLocalProfile,
  getLocalProfilePosts,
  getLocalProfiles,
  getLocalReplies,
  getLocalReports,
  getLocalRoles
} from "@/lib/local-db";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  AuditLogItem,
  Board,
  FriendshipItem,
  Message,
  NotificationItem,
  NoticeItem,
  Post,
  Profile,
  Reply,
  ReportItem,
  RoleItem
} from "@/lib/types";

type BoardRow = {
  id: number;
  slug: string;
  name: string;
  group_name: string;
  description: string;
  icon: string;
  theme_color: string;
  post_count: number;
  today_count: number;
  sort_order: number;
};

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  avatar_path: string | null;
  role: "admin" | "moderator" | "member";
  level_name: string;
  points: number;
  signature: string;
  created_at: string;
};

type PublicProfileRow = Omit<ProfileRow, "role" | "updated_at">;

type PostRow = {
  id: number;
  board_id: number;
  author_id: string | null;
  title: string;
  excerpt: string;
  content?: string | null;
  tags: string[];
  status: "featured" | "pinned" | "normal";
  reply_count: number;
  view_count: number;
  like_count: number;
  collect_count: number;
  created_at: string;
  updated_at: string;
};

type ReplyRow = {
  id: number;
  post_id: number;
  author_id: string | null;
  content: string;
  seat: number;
  is_visible: boolean;
  created_at: string;
};

type MessageRow = {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

type NotificationRow = {
  id: number;
  type: "reply" | "friend" | "system" | "report";
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
};

type ReportRow = {
  id: number;
  post_id: number | null;
  reason: string;
  status: "pending" | "resolved" | "rejected";
  created_at: string;
};

type NoticeRow = {
  id: number;
  title: string;
  content: string;
  board_id: number | null;
  is_active: boolean;
  created_at: string;
};

type RoleRow = {
  id: number;
  code: string;
  name: string;
  description: string;
};

type AuditLogRow = {
  id: number;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  created_at: string;
};

type FriendshipRow = {
  id: number;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
};

type PostReactionRow = {
  post_id: number;
};

type BookmarkRow = {
  post_id: number;
};

const BOARD_COLUMNS = "id,slug,name,group_name,description,icon,theme_color,post_count,today_count,sort_order";
const PUBLIC_PROFILE_COLUMNS = "id,username,display_name,avatar_path,level_name,points,signature,created_at";
const PROFILE_COLUMNS = "id,username,display_name,avatar_path,role,level_name,points,signature,created_at";
const POST_LIST_COLUMNS =
  "id,board_id,author_id,title,excerpt,tags,status,reply_count,view_count,like_count,collect_count,created_at,updated_at";
const POST_DETAIL_COLUMNS =
  "id,board_id,author_id,title,excerpt,tags,status,reply_count,view_count,like_count,collect_count,created_at,updated_at,content";
const REPLY_COLUMNS = "id,post_id,author_id,content,seat,is_visible,created_at";
const NOTIFICATION_COLUMNS = "id,type,title,description,is_read,created_at";
const REPORT_COLUMNS = "id,post_id,reason,status,created_at";
const NOTICE_COLUMNS = "id,title,content,board_id,is_active,created_at";
const ROLE_COLUMNS = "id,code,name,description";
const AUDIT_LOG_COLUMNS = "id,actor_id,action,target_type,target_id,created_at";
const FRIENDSHIP_COLUMNS = "id,requester_id,addressee_id,status,created_at";

function fallback<T>(value: T) {
  return structuredClone(value);
}

function throwDataError(scope: string, error: { message: string }): never {
  throw new Error(`${scope}: ${error.message}`);
}

function resolveAvatarPath(path: string | null | undefined) {
  const value = String(path ?? "").trim();
  return value.length ? value : "/avatars/placeholder-user.svg";
}

function mapBoard(item: BoardRow): Board {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    group: item.group_name,
    description: item.description,
    icon: item.icon,
    themeColor: item.theme_color,
    sortOrder: item.sort_order,
    postCount: item.post_count,
    todayCount: item.today_count
  };
}

function mapProfile(item: ProfileRow): Profile {
  return {
    id: item.id,
    username: item.username,
    displayName: item.display_name,
    avatar: resolveAvatarPath(item.avatar_path),
    role: item.role,
    level: item.level_name,
    points: item.points,
    joinedAt: item.created_at,
    signature: item.signature
  };
}

function mapPublicProfile(item: PublicProfileRow): Profile {
  return {
    id: item.id,
    username: item.username,
    displayName: item.display_name,
    avatar: resolveAvatarPath(item.avatar_path),
    role: "member",
    level: item.level_name,
    points: item.points,
    joinedAt: item.created_at,
    signature: item.signature
  };
}

function mapPost(item: PostRow): Post {
  return {
    id: item.id,
    boardId: item.board_id,
    authorId: item.author_id ?? "deleted",
    title: item.title,
    excerpt: item.excerpt,
    content: item.content ?? "",
    tags: item.tags ?? [],
    status: item.status,
    replyCount: item.reply_count,
    viewCount: item.view_count,
    likeCount: item.like_count,
    collectCount: item.collect_count,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

function mapReply(item: ReplyRow): Reply {
  return {
    id: item.id,
    postId: item.post_id,
    authorId: item.author_id ?? "deleted",
    content: item.content,
    seat: item.seat,
    visible: item.is_visible,
    createdAt: item.created_at
  };
}

async function attachViewerPostState(postList: Post[], supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>) {
  if (!supabase || postList.length === 0) return postList;

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return postList.map((post) => ({ ...post, viewerHasLiked: false, viewerHasBookmarked: false }));
  }

  const ids = postList.map((post) => post.id);
  const [reactionResult, bookmarkResult] = await Promise.all([
    supabase.from("post_reactions").select("post_id").eq("user_id", user.id).eq("reaction", "like").in("post_id", ids),
    supabase.from("bookmarks").select("post_id").eq("user_id", user.id).in("post_id", ids)
  ]);
  if (reactionResult.error) {
    console.warn(`读取点赞状态失败: ${reactionResult.error.message}`);
  }
  if (bookmarkResult.error) {
    console.warn(`读取收藏状态失败: ${bookmarkResult.error.message}`);
  }

  const likedSet = new Set((reactionResult.data ?? []).map((item) => (item as PostReactionRow).post_id));
  const bookmarkedSet = new Set((bookmarkResult.data ?? []).map((item) => (item as BookmarkRow).post_id));
  return postList.map((post) => ({
    ...post,
    viewerHasLiked: likedSet.has(post.id),
    viewerHasBookmarked: bookmarkedSet.has(post.id)
  }));
}

export function getAnonymousProfile(): Profile {
  return {
    id: "deleted",
    username: "deleted",
    displayName: "已注销用户",
    avatar: "/avatars/placeholder-user.svg",
    role: "member",
    level: "Lv.1 新人",
    points: 0,
    joinedAt: new Date(0).toISOString(),
    signature: "该用户资料不可用。"
  };
}

export function getUnknownBoard(): Board {
  return {
    id: 0,
    slug: "unknown",
    name: "未知板块",
    group: "未知",
    description: "该板块不可用或已被移除。",
    icon: "CircleHelp",
    themeColor: "slate",
    sortOrder: 0,
    postCount: 0,
    todayCount: 0
  };
}

export async function getBoards(): Promise<Board[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalBoards();
  }

  const { data, error } = await supabase.from("boards").select(BOARD_COLUMNS).order("sort_order", { ascending: true });
  if (error) throwDataError("读取板块失败", error);
  return (data ?? []).map((item) => mapBoard(item as BoardRow));
}

export async function getPosts(limit = 50, options: { includeContent?: boolean } = {}): Promise<Post[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalPosts(limit, options);
  }

  const query = options.includeContent
    ? supabase.from("posts").select(POST_DETAIL_COLUMNS)
    : supabase.from("posts").select(POST_LIST_COLUMNS);
  const { data, error } = await query.order("updated_at", { ascending: false }).limit(limit);
  if (error) throwDataError("读取主题失败", error);
  const postList = (data ?? []).map((item) => mapPost(item as PostRow));
  return attachViewerPostState(postList, supabase);
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalProfiles();
  }

  const { data, error } = await supabase.from("public_profiles").select(PUBLIC_PROFILE_COLUMNS).order("created_at", { ascending: false });
  if (error) throwDataError("读取用户资料失败", error);
  return (data ?? []).map((item) => mapPublicProfile(item as PublicProfileRow));
}

export async function getAdminProfiles(): Promise<Profile[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalAdminProfiles();
  }

  const { data, error } = await supabase.from("profiles").select(PROFILE_COLUMNS).order("created_at", { ascending: false });
  if (error) throwDataError("读取用户资料失败", error);
  return (data ?? []).map((item) => mapProfile(item as ProfileRow));
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  if (!isSupabaseConfigured()) {
    return getLocalProfile(id);
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return undefined;
  const { data, error } = await supabase.from("public_profiles").select(PUBLIC_PROFILE_COLUMNS).eq("id", id).maybeSingle();
  if (error) throwDataError("读取用户资料失败", error);
  return data ? mapPublicProfile(data as PublicProfileRow) : undefined;
}

export async function getHomeData() {
  const [boardList, postList, profileList, homeStats] = await Promise.all([getBoards(), getPosts(), getProfiles(), getHomeStats()]);
  return {
    boards: boardList,
    posts: postList,
    profiles: profileList,
    stats: homeStats
  };
}

export async function getHomeStats() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalHomeStats();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [usersResult, postsResult, repliesResult, todayPostsResult] = await Promise.all([
    supabase.from("profiles").select("id", { count: "planned", head: true }),
    supabase.from("posts").select("id", { count: "planned", head: true }),
    supabase.from("post_replies").select("id", { count: "planned", head: true }),
    supabase.from("posts").select("id", { count: "planned", head: true }).gte("created_at", today.toISOString())
  ]);

  for (const [scope, result] of [
    ["统计用户失败", usersResult],
    ["统计主题失败", postsResult],
    ["统计回复失败", repliesResult],
    ["统计今日主题失败", todayPostsResult]
  ] as const) {
    if (result.error) {
      console.warn(`${scope}: ${result.error.message}`);
      return fallback(stats);
    }
  }

  return {
    users: usersResult.count ?? 0,
    posts: postsResult.count ?? 0,
    replies: repliesResult.count ?? 0,
    online: 0,
    todayPosts: todayPostsResult.count ?? 0
  };
}

export async function getBoard(slugOrId: string) {
  const boardList = await getBoards();
  return boardList.find((board) => board.slug === slugOrId || String(board.id) === slugOrId);
}

async function getPostReplies(postId: number) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return fallback(replies.filter((reply) => reply.postId === postId && reply.visible));
  }

  const { data, error } = await supabase
    .from("post_replies")
    .select(REPLY_COLUMNS)
    .eq("post_id", postId)
    .eq("is_visible", true)
    .order("created_at", { ascending: true });
  if (error) throwDataError("读取回复失败", error);
  return (data ?? []).map((item) => mapReply(item as ReplyRow));
}

export async function getPost(id: string | number) {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return undefined;
  }

  if (!isSupabaseConfigured()) {
    return getLocalPost(numericId);
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return undefined;
  const postColumns = POST_DETAIL_COLUMNS;
  const { data, error } = await supabase.from("posts").select(postColumns).eq("id", numericId).maybeSingle();
  if (error) throwDataError("读取主题失败", error);
  if (!data) return undefined;

  const post = mapPost(data as PostRow);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [profileList, boardList, replyList, likeResult, bookmarkResult] = await Promise.all([
    getProfiles(),
    getBoards(),
    getPostReplies(post.id),
    user
      ? supabase
          .from("post_reactions")
          .select("id", { count: "exact", head: true })
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .eq("reaction", "like")
      : Promise.resolve({ count: 0, error: null }),
    user
      ? supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("post_id", post.id).eq("user_id", user.id)
      : Promise.resolve({ count: 0, error: null })
  ]);
  if (likeResult.error) throwDataError("读取点赞状态失败", likeResult.error);
  if (bookmarkResult.error) throwDataError("读取收藏状态失败", bookmarkResult.error);

  return {
    post,
    author: profileList.find((profile) => profile.id === post.authorId) ?? getAnonymousProfile(),
    board: boardList.find((board) => board.id === post.boardId),
    replies: replyList,
    profiles: profileList,
    viewerHasLiked: (likeResult.count ?? 0) > 0,
    viewerHasBookmarked: (bookmarkResult.count ?? 0) > 0
  };
}

export async function getBoardPosts(boardId: number, options: { includeContent?: boolean } = {}) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalBoardPosts(boardId, options);
  }

  const query = options.includeContent
    ? supabase.from("posts").select(POST_DETAIL_COLUMNS)
    : supabase.from("posts").select(POST_LIST_COLUMNS);
  const { data, error } = await query.eq("board_id", boardId).order("updated_at", { ascending: false }).limit(100);
  if (error) throwDataError("读取板块主题失败", error);
  const postList = (data ?? []).map((item) => mapPost(item as PostRow));
  return attachViewerPostState(postList, supabase);
}

export async function getProfilePosts(profileId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalProfilePosts(profileId);
  }

  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_COLUMNS)
    .eq("author_id", profileId)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throwDataError("读取用户主题失败", error);
  const postList = (data ?? []).map((item) => mapPost(item as PostRow));
  return attachViewerPostState(postList, supabase);
}

export async function getMessages(): Promise<Message[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    const userId = await getCurrentLocalUserId();
    return userId ? getLocalMessages(userId) : [];
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("private_messages")
    .select("id,sender_id,receiver_id,content,is_read,created_at")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throwDataError("读取私信失败", error);

  return (data ?? []).map((item) => {
    const row = item as MessageRow;
    const fromSelf = row.sender_id === user.id;
    return {
      id: row.id,
      peerId: fromSelf ? row.receiver_id : row.sender_id,
      fromSelf,
      content: row.content,
      unread: !fromSelf && !row.is_read ? 1 : 0,
      createdAt: row.created_at
    };
  });
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return getCurrentLocalUserId();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error) return null;
  return user?.id ?? null;
}

export async function getFriendships(): Promise<FriendshipItem[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalFriendships();
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("friendships")
    .select(FRIENDSHIP_COLUMNS)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throwDataError("读取好友关系失败", error);

  return (data ?? []).map((item) => {
    const row = item as FriendshipRow;
    return {
      id: row.id,
      requesterId: row.requester_id,
      addresseeId: row.addressee_id,
      status: row.status,
      createdAt: row.created_at
    };
  });
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalNotifications();
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throwDataError("读取通知失败", error);
  return (data ?? []).map((item) => {
    const row = item as NotificationRow;
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      read: row.is_read,
      createdAt: row.created_at
    };
  });
}

export async function getReports(): Promise<ReportItem[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalReports();
  }

  const { data, error } = await supabase.from("reports").select(REPORT_COLUMNS).order("created_at", { ascending: false }).limit(100);
  if (error) throwDataError("读取举报失败", error);
  return (data ?? []).map((item) => {
    const row = item as ReportRow;
    return {
      id: row.id,
      postId: row.post_id ?? 0,
      reason: row.reason,
      status: row.status,
      createdAt: row.created_at
    };
  });
}

export async function getReplies(): Promise<Reply[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalReplies();
  }

  const { data, error } = await supabase.from("post_replies").select(REPLY_COLUMNS).order("created_at", { ascending: false }).limit(100);
  if (error) throwDataError("读取回复失败", error);
  return (data ?? []).map((item) => mapReply(item as ReplyRow));
}

export async function getNotices(): Promise<NoticeItem[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return getLocalNotices();

  const { data, error } = await supabase.from("notices").select(NOTICE_COLUMNS).order("created_at", { ascending: false }).limit(50);
  if (error) throwDataError("读取公告失败", error);
  return (data ?? []).map((item) => {
    const row = item as NoticeRow;
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      boardId: row.board_id,
      active: row.is_active,
      createdAt: row.created_at
    };
  });
}

export async function getRoles(): Promise<RoleItem[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalRoles();
  }

  const { data, error } = await supabase.from("roles").select(ROLE_COLUMNS).order("id", { ascending: true });
  if (error) throwDataError("读取角色失败", error);
  return (data ?? []).map((item) => {
    const row = item as RoleRow;
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description
    };
  });
}

export async function getAuditLogs(): Promise<AuditLogItem[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return getLocalAuditLogs();
  }

  const { data, error } = await supabase.from("audit_logs").select(AUDIT_LOG_COLUMNS).order("created_at", { ascending: false }).limit(100);
  if (error) throwDataError("读取审计日志失败", error);
  return (data ?? []).map((item) => {
    const row = item as AuditLogRow;
    return {
      id: row.id,
      actorId: row.actor_id,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      createdAt: row.created_at
    };
  });
}
