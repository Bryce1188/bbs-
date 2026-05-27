import { boards, friendships, messages, notifications, posts, profiles, replies, reports, stats } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/auth";
import { isDatabaseConfigured, queryOne, queryRows, toJsonArray } from "@/lib/mysql";
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

type PostRow = {
  id: number;
  board_id: number;
  author_id: string | null;
  title: string;
  excerpt: string;
  content?: string | null;
  tags: string | null;
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
  is_visible: number | boolean;
  created_at: string;
};

type MessageRow = {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: number | boolean;
  created_at: string;
};

type NotificationRow = {
  id: number;
  type: "reply" | "friend" | "system" | "report";
  title: string;
  description: string;
  is_read: number | boolean;
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
  is_active: number | boolean;
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

function fallback<T>(value: T) {
  return structuredClone(value);
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

function mapPost(item: PostRow): Post {
  return {
    id: item.id,
    boardId: item.board_id,
    authorId: item.author_id ?? "deleted",
    title: item.title,
    excerpt: item.excerpt,
    content: item.content ?? "",
    tags: toJsonArray(item.tags),
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
    visible: Boolean(item.is_visible),
    createdAt: item.created_at
  };
}

async function attachViewerPostState(postList: Post[]) {
  if (postList.length === 0) return postList;
  const user = await getCurrentUser();
  if (!user) {
    return postList.map((post) => ({ ...post, viewerHasLiked: false, viewerHasBookmarked: false }));
  }

  const ids = postList.map((post) => post.id);
  const placeholders = ids.map(() => "?").join(",");
  const likeRows = await queryRows<{ post_id: number }>(
    `select post_id from post_reactions where user_id = ? and reaction = 'like' and post_id in (${placeholders})`,
    [user.id, ...ids]
  );
  const bookmarkRows = await queryRows<{ post_id: number }>(
    `select post_id from bookmarks where user_id = ? and post_id in (${placeholders})`,
    [user.id, ...ids]
  );

  const likedSet = new Set(likeRows.map((item) => item.post_id));
  const bookmarkedSet = new Set(bookmarkRows.map((item) => item.post_id));
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
  if (!isDatabaseConfigured()) return fallback(boards);
  const rows = await queryRows<BoardRow>(
    "select id,slug,name,group_name,description,icon,theme_color,post_count,today_count,sort_order from boards order by sort_order asc"
  );
  return rows.map(mapBoard);
}

export async function getPosts(limit = 50, options: { includeContent?: boolean } = {}): Promise<Post[]> {
  if (!isDatabaseConfigured()) {
    return fallback(posts).map((post) => ({ ...post, viewerHasLiked: false, viewerHasBookmarked: false }));
  }

  const columns =
    "id,board_id,author_id,title,excerpt," +
    (options.includeContent ? "content," : "") +
    "tags,status,reply_count,view_count,like_count,collect_count,created_at,updated_at";
  const rows = await queryRows<PostRow>(`select ${columns} from posts order by updated_at desc limit ?`, [limit]);
  return attachViewerPostState(rows.map(mapPost));
}

export async function getHotTopics(limit = 20) {
  const postList = await getPosts(200);
  const normalizedLimit = Math.max(1, Math.min(limit, 100));
  return [...postList]
    .sort((a, b) => b.viewCount + b.likeCount - (a.viewCount + a.likeCount))
    .slice(0, normalizedLimit)
    .map((post) => ({
      ...post,
      hotScore: post.viewCount + post.likeCount
    }));
}

export async function getProfiles(): Promise<Profile[]> {
  if (!isDatabaseConfigured()) return fallback(profiles);
  const rows = await queryRows<ProfileRow>(
    "select id,username,display_name,avatar_path,'member' as role,level_name,points,signature,created_at from view_public_profiles order by created_at desc"
  );
  return rows.map((item) => ({ ...mapProfile(item), role: "member" }));
}

export async function getAdminProfiles(): Promise<Profile[]> {
  if (!isDatabaseConfigured()) return fallback(profiles);
  const rows = await queryRows<ProfileRow>(
    "select id,username,display_name,avatar_path,role,level_name,points,signature,created_at from profiles order by created_at desc"
  );
  return rows.map(mapProfile);
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  if (!isDatabaseConfigured()) {
    return fallback(profiles).find((profile) => profile.id === id);
  }
  const row = await queryOne<ProfileRow>(
    "select id,username,display_name,avatar_path,'member' as role,level_name,points,signature,created_at from view_public_profiles where id = ? limit 1",
    [id]
  );
  if (!row) return undefined;
  return { ...mapProfile(row), role: "member" };
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
  if (!isDatabaseConfigured()) return fallback(stats);
  const usersRow = await queryOne<{ total: number }>("select count(*) as total from profiles");
  const postsRow = await queryOne<{ total: number }>("select count(*) as total from posts");
  const repliesRow = await queryOne<{ total: number }>("select count(*) as total from post_replies");
  const todayPostsRow = await queryOne<{ total: number }>("select count(*) as total from posts where date(created_at) = current_date()");

  return {
    users: Number(usersRow?.total ?? 0),
    posts: Number(postsRow?.total ?? 0),
    replies: Number(repliesRow?.total ?? 0),
    online: 0,
    todayPosts: Number(todayPostsRow?.total ?? 0)
  };
}

export async function getBoard(slugOrId: string) {
  const boardList = await getBoards();
  return boardList.find((board) => board.slug === slugOrId || String(board.id) === slugOrId);
}

async function getPostReplies(postId: number) {
  if (!isDatabaseConfigured()) {
    return fallback(replies.filter((reply) => reply.postId === postId && reply.visible));
  }
  const rows = await queryRows<ReplyRow>(
    "select id,post_id,author_id,content,seat,is_visible,created_at from post_replies where post_id = ? and is_visible = 1 order by created_at asc",
    [postId]
  );
  return rows.map(mapReply);
}

export async function getPost(id: string | number) {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return undefined;

  if (!isDatabaseConfigured()) {
    const post = fallback(posts).find((item) => item.id === numericId);
    if (!post) return undefined;
    const profileList = fallback(profiles);
    const boardList = fallback(boards);
    return {
      post,
      author: profileList.find((profile) => profile.id === post.authorId) ?? getAnonymousProfile(),
      board: boardList.find((board) => board.id === post.boardId),
      replies: fallback(replies.filter((reply) => reply.postId === post.id && reply.visible)),
      profiles: profileList,
      viewerHasLiked: false,
      viewerHasBookmarked: false
    };
  }

  const row = await queryOne<PostRow>(
    "select id,board_id,author_id,title,excerpt,content,tags,status,reply_count,view_count,like_count,collect_count,created_at,updated_at from posts where id = ? limit 1",
    [numericId]
  );
  if (!row) return undefined;
  const post = mapPost(row);
  const [profileList, boardList, replyList, user] = await Promise.all([getProfiles(), getBoards(), getPostReplies(post.id), getCurrentUser()]);

  let viewerHasLiked = false;
  let viewerHasBookmarked = false;
  if (user) {
    const likeRow = await queryOne<{ id: number }>(
      "select id from post_reactions where post_id = ? and user_id = ? and reaction = 'like' limit 1",
      [post.id, user.id]
    );
    const bookmarkRow = await queryOne<{ id: number }>("select id from bookmarks where post_id = ? and user_id = ? limit 1", [post.id, user.id]);
    viewerHasLiked = Boolean(likeRow);
    viewerHasBookmarked = Boolean(bookmarkRow);
  }

  return {
    post,
    author: profileList.find((profile) => profile.id === post.authorId) ?? getAnonymousProfile(),
    board: boardList.find((board) => board.id === post.boardId),
    replies: replyList,
    profiles: profileList,
    viewerHasLiked,
    viewerHasBookmarked
  };
}

export async function getBoardPosts(boardId: number, options: { includeContent?: boolean } = {}) {
  if (!isDatabaseConfigured()) {
    return fallback(posts.filter((post) => post.boardId === boardId)).map((post) => ({
      ...post,
      viewerHasLiked: false,
      viewerHasBookmarked: false
    }));
  }

  const columns =
    "id,board_id,author_id,title,excerpt," +
    (options.includeContent ? "content," : "") +
    "tags,status,reply_count,view_count,like_count,collect_count,created_at,updated_at";
  const rows = await queryRows<PostRow>(`select ${columns} from posts where board_id = ? order by updated_at desc limit 100`, [boardId]);
  return attachViewerPostState(rows.map(mapPost));
}

export async function getProfilePosts(profileId: string) {
  if (!isDatabaseConfigured()) {
    return fallback(posts.filter((post) => post.authorId === profileId)).map((post) => ({
      ...post,
      viewerHasLiked: false,
      viewerHasBookmarked: false
    }));
  }
  const rows = await queryRows<PostRow>(
    "select id,board_id,author_id,title,excerpt,tags,status,reply_count,view_count,like_count,collect_count,created_at,updated_at from posts where author_id = ? order by updated_at desc limit 50",
    [profileId]
  );
  return attachViewerPostState(rows.map(mapPost));
}

export async function getMessages(): Promise<Message[]> {
  if (!isDatabaseConfigured()) return fallback(messages);
  const user = await getCurrentUser();
  if (!user) return [];

  const rows = await queryRows<MessageRow>(
    `
      select id,sender_id,receiver_id,content,is_read,created_at
      from private_messages
      where sender_id = ? or receiver_id = ?
      order by created_at desc
      limit 100
    `,
    [user.id, user.id]
  );

  return rows.map((item) => {
    const fromSelf = item.sender_id === user.id;
    return {
      id: item.id,
      peerId: fromSelf ? item.receiver_id : item.sender_id,
      fromSelf,
      content: item.content,
      unread: !fromSelf && !Boolean(item.is_read) ? 1 : 0,
      createdAt: item.created_at
    };
  });
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

export async function getFriendships(): Promise<FriendshipItem[]> {
  if (!isDatabaseConfigured()) return fallback(friendships);
  const user = await getCurrentUser();
  if (!user) return [];

  const rows = await queryRows<FriendshipRow>(
    `
      select id,requester_id,addressee_id,status,created_at
      from friendships
      where requester_id = ? or addressee_id = ?
      order by created_at desc
      limit 100
    `,
    [user.id, user.id]
  );

  return rows.map((item) => ({
    id: item.id,
    requesterId: item.requester_id,
    addresseeId: item.addressee_id,
    status: item.status,
    createdAt: item.created_at
  }));
}

export async function getNotifications(): Promise<NotificationItem[]> {
  if (!isDatabaseConfigured()) return fallback(notifications);
  const user = await getCurrentUser();
  if (!user) return [];

  const rows = await queryRows<NotificationRow>(
    "select id,type,title,description,is_read,created_at from notifications where user_id = ? order by created_at desc limit 100",
    [user.id]
  );
  return rows.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    read: Boolean(item.is_read),
    createdAt: item.created_at
  }));
}

export async function getReports(): Promise<ReportItem[]> {
  if (!isDatabaseConfigured()) return fallback(reports);
  const rows = await queryRows<ReportRow>("select id,post_id,reason,status,created_at from reports order by created_at desc limit 100");
  return rows.map((item) => ({
    id: item.id,
    postId: item.post_id ?? 0,
    reason: item.reason,
    status: item.status,
    createdAt: item.created_at
  }));
}

export async function getReplies(): Promise<Reply[]> {
  if (!isDatabaseConfigured()) return fallback(replies);
  const rows = await queryRows<ReplyRow>("select id,post_id,author_id,content,seat,is_visible,created_at from post_replies order by created_at desc limit 100");
  return rows.map(mapReply);
}

export async function getNotices(): Promise<NoticeItem[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await queryRows<NoticeRow>("select id,title,content,board_id,is_active,created_at from notices order by created_at desc limit 50");
  return rows.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    boardId: item.board_id,
    active: Boolean(item.is_active),
    createdAt: item.created_at
  }));
}

export async function getRoles(): Promise<RoleItem[]> {
  if (!isDatabaseConfigured()) {
    return [
      { id: 1, code: "admin", name: "超级管理员", description: "拥有后台全量权限" },
      { id: 2, code: "moderator", name: "板块管理员", description: "管理分配板块内的帖子和举报" },
      { id: 3, code: "member", name: "普通用户", description: "发帖、回复、收藏和私信" }
    ];
  }

  const rows = await queryRows<RoleRow>("select id,code,name,description from roles order by id asc");
  return rows.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    description: item.description
  }));
}

export async function getAuditLogs(): Promise<AuditLogItem[]> {
  if (!isDatabaseConfigured()) {
    return [
      { id: 1, actorId: "admin", action: "update_board_order", targetType: "board", targetId: "1", createdAt: new Date().toISOString() },
      { id: 2, actorId: "moderator", action: "resolve_report", targetType: "report", targetId: "1", createdAt: new Date().toISOString() }
    ];
  }

  const rows = await queryRows<AuditLogRow>(
    "select id,actor_id,action,target_type,target_id,created_at from audit_logs order by created_at desc limit 100"
  );
  return rows.map((item) => ({
    id: item.id,
    actorId: item.actor_id,
    action: item.action,
    targetType: item.target_type,
    targetId: item.target_id,
    createdAt: item.created_at
  }));
}
