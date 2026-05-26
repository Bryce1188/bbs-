import type { Board, FriendshipItem, Message, NotificationItem, Post, Profile, Reply, ReportItem } from "@/lib/types";

export const profiles: Profile[] = [
  {
    id: "admin",
    username: "admin",
    displayName: "管理员",
    avatar: "/avatars/admin.svg",
    role: "admin",
    level: "Lv.8 星河领航员",
    points: 9820,
    joinedAt: "2026-05-24T13:38:00+08:00",
    signature: "让社区保持有序，也让讨论保持温度。"
  },
  {
    id: "lin",
    username: "lin",
    displayName: "林同学",
    avatar: "/avatars/member-a.svg",
    role: "member",
    level: "Lv.5 深度水友",
    points: 4210,
    joinedAt: "2026-05-22T09:12:00+08:00",
    signature: "喜欢编程、设计和把复杂问题讲清楚。"
  },
  {
    id: "miao",
    username: "miao",
    displayName: "妙妙",
    avatar: "/avatars/member-b.svg",
    role: "moderator",
    level: "Lv.6 版块守望者",
    points: 6380,
    joinedAt: "2026-05-20T18:30:00+08:00",
    signature: "公告、活动和资源整理中。"
  }
];

export const boards: Board[] = [
  { id: 1, slug: "departments", name: "部门交融", group: "企业专区", description: "跨部门协作、流程沟通与经验交换。", icon: "Network", themeColor: "teal", sortOrder: 1, postCount: 128, todayCount: 12 },
  { id: 2, slug: "hobbies", name: "特长爱好", group: "企业专区", description: "运动、音乐、摄影、手作和生活灵感。", icon: "Sparkles", themeColor: "amber", sortOrder: 2, postCount: 96, todayCount: 9 },
  { id: 3, slug: "stories", name: "坊间趣事", group: "企业专区", description: "轻松讨论和社区见闻。", icon: "MessagesSquare", themeColor: "sky", sortOrder: 3, postCount: 82, todayCount: 7 },
  { id: 4, slug: "gaming", name: "游戏交流", group: "交流与讨论", description: "组队、攻略、硬件和游戏体验。", icon: "Gamepad2", themeColor: "violet", sortOrder: 4, postCount: 76, todayCount: 8 },
  { id: 5, slug: "wall", name: "告白墙", group: "交流与讨论", description: "公开表达、匿名心事和温柔回应。", icon: "Heart", themeColor: "rose", sortOrder: 5, postCount: 54, todayCount: 5 },
  { id: 6, slug: "jobs", name: "兼职", group: "交流与讨论", description: "兼职信息、避坑经验和岗位推荐。", icon: "Briefcase", themeColor: "emerald", sortOrder: 6, postCount: 61, todayCount: 4 },
  { id: 7, slug: "resources", name: "资源共享", group: "交流与讨论", description: "课程、工具、素材和学习路线。", icon: "FolderOpen", themeColor: "cyan", sortOrder: 7, postCount: 145, todayCount: 13 },
  { id: 8, slug: "code", name: "编程开发", group: "交流与讨论", description: "项目、Bug、框架和工程实践。", icon: "Code2", themeColor: "indigo", sortOrder: 8, postCount: 172, todayCount: 16 },
  { id: 9, slug: "general", name: "综合交流", group: "交流与讨论", description: "不设边界的日常交流区。", icon: "PanelsTopLeft", themeColor: "slate", sortOrder: 9, postCount: 119, todayCount: 10 },
  { id: 10, slug: "qa", name: "求助问答", group: "交流与讨论", description: "提问、解答、追问和问题归档。", icon: "CircleHelp", themeColor: "orange", sortOrder: 10, postCount: 91, todayCount: 6 },
  { id: 11, slug: "lost-found", name: "寻物启事", group: "交流与讨论", description: "失物招领、寻物和线索同步。", icon: "Search", themeColor: "lime", sortOrder: 11, postCount: 38, todayCount: 3 },
  { id: 12, slug: "chat", name: "休闲灌水", group: "交流与讨论", description: "灌水、接龙和轻量互动。", icon: "Coffee", themeColor: "fuchsia", sortOrder: 12, postCount: 188, todayCount: 19 }
];

export const posts: Post[] = [
  {
    id: 1001,
    boardId: 8,
    authorId: "lin",
    title: "Next.js 版论坛迁移记录：从 JSP 式页面到组件化社区",
    excerpt: "记录一次从 Spring MVC 多页应用迁移到 Next.js、Supabase、Vercel 的拆解路径。",
    content:
      "迁移的重点不是把旧页面逐行搬过去，而是先抽取业务语义：板块、主题、回复、用户、消息、权限。新的实现把展示层拆成可组合组件，数据层用 Supabase schema 和 RLS 约束行为，部署层交给 Vercel。",
    tags: ["Next.js", "Supabase", "重构"],
    status: "featured",
    replyCount: 28,
    viewCount: 3180,
    likeCount: 241,
    collectCount: 88,
    createdAt: "2026-05-26T09:20:00+08:00",
    updatedAt: "2026-05-26T12:40:00+08:00"
  },
  {
    id: 1002,
    boardId: 7,
    authorId: "miao",
    title: "资源合集：写论文、做展示和做答辩时最常用的工具",
    excerpt: "从图标、配色、文献管理到演示动画的一份轻量清单。",
    content:
      "这份合集按任务组织：资料查找、图表制作、演示设计、动效标注和部署验证。每个工具都附上适用场景，避免为了工具而工具。",
    tags: ["资源", "工具", "展示"],
    status: "pinned",
    replyCount: 46,
    viewCount: 4862,
    likeCount: 392,
    collectCount: 154,
    createdAt: "2026-05-25T16:10:00+08:00",
    updatedAt: "2026-05-26T08:16:00+08:00"
  },
  {
    id: 1003,
    boardId: 10,
    authorId: "admin",
    title: "求助区发帖模板：如何让问题更容易被解决",
    excerpt: "建议包含复现步骤、环境版本、报错截图和你已经尝试过的方案。",
    content:
      "好的求助帖通常包含四块信息：背景、现象、复现步骤和预期结果。标题尽量具体，正文补充环境版本，最后说明已尝试方案。",
    tags: ["规范", "问答"],
    status: "normal",
    replyCount: 15,
    viewCount: 1264,
    likeCount: 95,
    collectCount: 31,
    createdAt: "2026-05-24T20:00:00+08:00",
    updatedAt: "2026-05-25T11:28:00+08:00"
  },
  {
    id: 1004,
    boardId: 1,
    authorId: "miao",
    title: "本周跨部门同步：接口联调、文档归档与排期变化",
    excerpt: "请相关同学在评论区补充接口负责人和联调时间。",
    content: "本周重点是把接口文档统一到新版空间，并把未对齐的字段命名在周三前收口。排期变化请在评论区同步。",
    tags: ["协作", "公告"],
    status: "normal",
    replyCount: 12,
    viewCount: 980,
    likeCount: 64,
    collectCount: 18,
    createdAt: "2026-05-24T10:30:00+08:00",
    updatedAt: "2026-05-24T18:30:00+08:00"
  }
];

export const replies: Reply[] = [
  { id: 1, postId: 1001, authorId: "miao", content: "建议把旧接口先整理成功能矩阵，迁移时会少走很多弯路。", seat: 1, visible: true, createdAt: "2026-05-26T10:18:00+08:00" },
  { id: 2, postId: 1001, authorId: "admin", content: "后台权限和前台会话要分开验收，旧项目这两块耦合比较明显。", seat: 2, visible: true, createdAt: "2026-05-26T10:42:00+08:00" },
  { id: 3, postId: 1002, authorId: "lin", content: "图表部分可以加一个专门的模板区，方便答辩前快速复用。", seat: 1, visible: false, createdAt: "2026-05-25T17:10:00+08:00" }
];

export const friendships: FriendshipItem[] = [
  { id: 1, requesterId: "lin", addresseeId: "admin", status: "pending", createdAt: "2026-05-26T09:55:00+08:00" },
  { id: 2, requesterId: "admin", addresseeId: "miao", status: "accepted", createdAt: "2026-05-25T19:30:00+08:00" }
];

export const messages: Message[] = [
  { id: 1, peerId: "miao", fromSelf: false, content: "我把后台列表的字段整理好了，等你接 Supabase schema。", unread: 2, createdAt: "2026-05-26T13:10:00+08:00" },
  { id: 2, peerId: "lin", fromSelf: true, content: "首页动效先轻一点，保证移动端不掉帧。", unread: 0, createdAt: "2026-05-26T12:48:00+08:00" }
];

export const notifications: NotificationItem[] = [
  { id: 1, type: "reply", title: "你的主题有新回复", description: "妙妙 回复了《Next.js 版论坛迁移记录》", read: false, createdAt: "2026-05-26T10:18:00+08:00" },
  { id: 2, type: "friend", title: "新的好友申请", description: "林同学 想添加你为好友", read: false, createdAt: "2026-05-26T09:55:00+08:00" },
  { id: 3, type: "system", title: "系统公告", description: "新版社区展示页已进入部署验证阶段", read: true, createdAt: "2026-05-25T20:30:00+08:00" }
];

export const reports: ReportItem[] = [
  { id: 1, postId: 1003, reason: "标题不够明确，需要补充环境信息", status: "pending", createdAt: "2026-05-26T08:20:00+08:00" },
  { id: 2, postId: 1002, reason: "资源链接已失效", status: "resolved", createdAt: "2026-05-25T18:12:00+08:00" }
];

export const stats = {
  users: 1286,
  posts: 1250,
  replies: 8420,
  online: 73,
  todayPosts: boards.reduce((sum, board) => sum + board.todayCount, 0)
};
