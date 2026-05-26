export type Board = {
  id: number;
  slug: string;
  name: string;
  group: string;
  description: string;
  icon: string;
  themeColor: string;
  sortOrder: number;
  postCount: number;
  todayCount: number;
};

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  role: "admin" | "moderator" | "member";
  level: string;
  points: number;
  joinedAt: string;
  signature: string;
};

export type Post = {
  id: number;
  boardId: number;
  authorId: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: "featured" | "pinned" | "normal";
  replyCount: number;
  viewCount: number;
  likeCount: number;
  collectCount: number;
  viewerHasLiked?: boolean;
  viewerHasBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Reply = {
  id: number;
  postId: number;
  authorId: string;
  content: string;
  seat: number;
  visible: boolean;
  createdAt: string;
};

export type Message = {
  id: number;
  peerId: string;
  fromSelf: boolean;
  content: string;
  unread: number;
  clientMsgId?: string;
  createdAt: string;
};

export type NotificationItem = {
  id: number;
  type: "reply" | "friend" | "system" | "report";
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
};

export type ReportItem = {
  id: number;
  postId: number;
  reason: string;
  status: "pending" | "resolved" | "rejected";
  createdAt: string;
};

export type NoticeItem = {
  id: number;
  title: string;
  content: string;
  boardId: number | null;
  active: boolean;
  createdAt: string;
};

export type RoleItem = {
  id: number;
  code: "admin" | "moderator" | "member" | string;
  name: string;
  description: string;
};

export type AuditLogItem = {
  id: number;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  createdAt: string;
};

export type FriendshipItem = {
  id: number;
  requesterId: string;
  addresseeId: string;
  status: "pending" | "accepted" | "rejected" | string;
  createdAt: string;
};
