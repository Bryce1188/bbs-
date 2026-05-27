import type { Board, FriendshipItem, Message, NotificationItem, Post, Profile, Reply, ReportItem } from "@/lib/types";

export const profiles: Profile[] = [
  {
    id: "xzr",
    username: "xzr",
    displayName: "xzr",
    avatar: "/avatars/admin.svg",
    role: "admin",
    level: "Lv.8 管理员",
    points: 4820,
    joinedAt: "2026-05-20T09:10:00+08:00",
    signature: "负责维护论坛秩序，也会整理学习资料。"
  },
  {
    id: "lp",
    username: "lp",
    displayName: "lp",
    avatar: "/avatars/member-a.svg",
    role: "moderator",
    level: "Lv.6 版主",
    points: 3260,
    joinedAt: "2026-05-20T10:35:00+08:00",
    signature: "喜欢把问题拆清楚再动手。"
  },
  {
    id: "ywt",
    username: "ywt",
    displayName: "ywt",
    avatar: "/avatars/member-b.svg",
    role: "member",
    level: "Lv.5 活跃成员",
    points: 2790,
    joinedAt: "2026-05-21T14:22:00+08:00",
    signature: "最近在学前端和数据库。"
  },
  {
    id: "lsw",
    username: "lsw",
    displayName: "lsw",
    avatar: "/avatars/placeholder-user.svg",
    role: "member",
    level: "Lv.4 认真回帖",
    points: 2180,
    joinedAt: "2026-05-22T08:18:00+08:00",
    signature: "有问题先搜索，再提问。"
  },
  {
    id: "zxy",
    username: "zxy",
    displayName: "zxy",
    avatar: "/avatars/member-a.svg",
    role: "member",
    level: "Lv.3 分享达人",
    points: 1560,
    joinedAt: "2026-05-22T19:40:00+08:00",
    signature: "爱分享工具、模板和避坑经验。"
  },
  {
    id: "hzy",
    username: "hzy",
    displayName: "hzy",
    avatar: "/avatars/member-b.svg",
    role: "member",
    level: "Lv.3 游戏同好",
    points: 1420,
    joinedAt: "2026-05-23T11:05:00+08:00",
    signature: "晚上常在线，组队可以叫我。"
  },
  {
    id: "wxy",
    username: "wxy",
    displayName: "wxy",
    avatar: "/avatars/placeholder-user.svg",
    role: "member",
    level: "Lv.2 新朋友",
    points: 860,
    joinedAt: "2026-05-24T16:26:00+08:00",
    signature: "喜欢摄影和校园日常记录。"
  },
  {
    id: "cjy",
    username: "cjy",
    displayName: "cjy",
    avatar: "/avatars/member-a.svg",
    role: "member",
    level: "Lv.2 热心路人",
    points: 740,
    joinedAt: "2026-05-25T12:12:00+08:00",
    signature: "看到求助贴会尽量帮一把。"
  }
];

export const boards: Board[] = [
  { id: 1, slug: "departments", name: "部门交流", group: "校园专区", description: "班级、社团、小组协作与通知同步。", icon: "Network", themeColor: "teal", sortOrder: 1, postCount: 4, todayCount: 1 },
  { id: 2, slug: "hobbies", name: "特长爱好", group: "校园专区", description: "运动、音乐、摄影、手工和生活灵感。", icon: "Sparkles", themeColor: "amber", sortOrder: 2, postCount: 5, todayCount: 2 },
  { id: 3, slug: "stories", name: "坊间趣事", group: "校园专区", description: "轻松记录校园里有意思的小事。", icon: "MessagesSquare", themeColor: "sky", sortOrder: 3, postCount: 3, todayCount: 1 },
  { id: 4, slug: "gaming", name: "游戏交流", group: "交流与讨论", description: "组队、攻略、设备和游戏体验。", icon: "Gamepad2", themeColor: "violet", sortOrder: 4, postCount: 4, todayCount: 1 },
  { id: 5, slug: "wall", name: "告白墙", group: "交流与讨论", description: "公开表达、匿名心事和温柔回应。", icon: "Heart", themeColor: "rose", sortOrder: 5, postCount: 3, todayCount: 1 },
  { id: 6, slug: "jobs", name: "兼职", group: "交流与讨论", description: "兼职信息、避坑经验和岗位推荐。", icon: "Briefcase", themeColor: "emerald", sortOrder: 6, postCount: 4, todayCount: 1 },
  { id: 7, slug: "resources", name: "资源共享", group: "交流与讨论", description: "课程、工具、素材和学习路线。", icon: "FolderOpen", themeColor: "cyan", sortOrder: 7, postCount: 5, todayCount: 2 },
  { id: 8, slug: "code", name: "编程开发", group: "交流与讨论", description: "项目、Bug、框架和工程实践。", icon: "Code2", themeColor: "indigo", sortOrder: 8, postCount: 6, todayCount: 2 },
  { id: 9, slug: "general", name: "综合交流", group: "交流与讨论", description: "不设边界的日常交流区。", icon: "PanelsTopLeft", themeColor: "slate", sortOrder: 9, postCount: 4, todayCount: 1 },
  { id: 10, slug: "qa", name: "求助问答", group: "交流与讨论", description: "提问、解答、追问和问题归档。", icon: "CircleHelp", themeColor: "orange", sortOrder: 10, postCount: 5, todayCount: 2 },
  { id: 11, slug: "lost-found", name: "寻物启事", group: "交流与讨论", description: "失物招领、寻物和线索同步。", icon: "Search", themeColor: "lime", sortOrder: 11, postCount: 3, todayCount: 1 },
  { id: 12, slug: "chat", name: "休闲灌水", group: "交流与讨论", description: "灌水、接龙和轻量互动。", icon: "Coffee", themeColor: "fuchsia", sortOrder: 12, postCount: 6, todayCount: 3 }
];

export const posts: Post[] = [
  {
    id: 1001,
    boardId: 8,
    authorId: "xzr",
    title: "Next.js 项目本地运行时，环境变量应该怎么配？",
    excerpt: "整理了一下本地跑论坛项目时最容易漏掉的 .env.local、端口和 Supabase 配置。",
    content:
      "今天把论坛项目重新跑了一遍，发现最容易出问题的地方不是代码，而是环境变量。没有接 Supabase 的时候，NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 要留空，这样页面会走 mock 数据；如果填了占位地址，应用会以为数据库已经配置好，反而容易请求失败。端口被占用时可以先关掉旧的 node 进程，再重新 npm run dev。",
    tags: ["Next.js", "环境配置", "本地运行"],
    status: "featured",
    replyCount: 3,
    viewCount: 86,
    likeCount: 4,
    collectCount: 2,
    viewerHasLiked: true,
    viewerHasBookmarked: true,
    createdAt: "2026-05-27T09:20:00+08:00",
    updatedAt: "2026-05-27T10:12:00+08:00"
  },
  {
    id: 1002,
    boardId: 7,
    authorId: "zxy",
    title: "期末复习资料汇总：软件工程、数据库和前端",
    excerpt: "把最近几天大家发过的资料整理成一份清单，方便复习前直接找。",
    content:
      "软件工程部分建议先看需求分析、用例图、类图和测试用例；数据库部分重点复习范式、SQL 查询、索引和事务；前端部分可以按 HTML/CSS、React 状态、路由和接口请求来整理。资料我会继续在评论区补充，大家也可以把自己觉得有用的链接发上来。",
    tags: ["复习", "资料", "期末"],
    status: "pinned",
    replyCount: 4,
    viewCount: 132,
    likeCount: 5,
    collectCount: 4,
    viewerHasLiked: false,
    viewerHasBookmarked: true,
    createdAt: "2026-05-26T20:10:00+08:00",
    updatedAt: "2026-05-27T08:16:00+08:00"
  },
  {
    id: 1003,
    boardId: 10,
    authorId: "lsw",
    title: "登录页提交后没有反应，应该先排查哪里？",
    excerpt: "按钮能点，页面不跳转，也没有明显报错，想问一下排查顺序。",
    content:
      "我现在遇到的问题是登录表单提交后页面没有变化。浏览器控制台没有看到红色报错，终端也没有明显异常。我猜可能和 server action 或 Supabase 配置有关，但不确定应该先看网络请求、环境变量还是代码逻辑。有没有比较清晰的排查顺序？",
    tags: ["求助", "登录", "排查"],
    status: "normal",
    replyCount: 3,
    viewCount: 64,
    likeCount: 2,
    collectCount: 1,
    createdAt: "2026-05-27T11:00:00+08:00",
    updatedAt: "2026-05-27T11:28:00+08:00"
  },
  {
    id: 1004,
    boardId: 1,
    authorId: "lp",
    title: "本周小组任务同步：页面、接口和测试分工",
    excerpt: "请各组把自己负责的页面和接口进度写在评论里，今晚统一对齐。",
    content:
      "目前首页、板块列表、帖子详情和私信页面已经能展示 mock 数据。接口这边主要还差真实 Supabase 环境和 seed 数据。测试部分建议先保证 npm run typecheck、npm run lint、npm run build 都通过，再做页面手动验收。每个人在评论里写一下自己负责的部分和当前卡点。",
    tags: ["小组协作", "进度同步"],
    status: "normal",
    replyCount: 3,
    viewCount: 58,
    likeCount: 3,
    collectCount: 1,
    createdAt: "2026-05-27T08:30:00+08:00",
    updatedAt: "2026-05-27T09:05:00+08:00"
  },
  {
    id: 1005,
    boardId: 2,
    authorId: "wxy",
    title: "周末有人一起去拍校园夜景吗？",
    excerpt: "想拍教学楼、操场和路灯下的树影，顺便练一下构图。",
    content:
      "最近傍晚的天色很好看，想周六晚上带相机去拍一组校园夜景。路线大概是图书馆、操场、实验楼和湖边。如果有人也喜欢摄影，可以一起走一圈，互相帮忙看构图和参数。",
    tags: ["摄影", "周末", "校园"],
    status: "normal",
    replyCount: 2,
    viewCount: 47,
    likeCount: 3,
    collectCount: 0,
    createdAt: "2026-05-26T18:40:00+08:00",
    updatedAt: "2026-05-26T21:10:00+08:00"
  },
  {
    id: 1006,
    boardId: 4,
    authorId: "hzy",
    title: "今晚八点五排缺一，有没有会辅助的？",
    excerpt: "娱乐局，主要是语音沟通和练配合，不要求段位太高。",
    content:
      "今晚八点左右想开一组五排，目前差一个辅助位。我们这边比较偏娱乐，不压力队友，主要练沟通和节奏。能开麦最好，不能开麦也可以打字报点。想来的在评论里留一下常用位置。",
    tags: ["组队", "五排", "娱乐局"],
    status: "normal",
    replyCount: 3,
    viewCount: 52,
    likeCount: 2,
    collectCount: 0,
    createdAt: "2026-05-27T16:05:00+08:00",
    updatedAt: "2026-05-27T16:38:00+08:00"
  },
  {
    id: 1007,
    boardId: 5,
    authorId: "cjy",
    title: "想谢谢今天帮我搬资料的同学",
    excerpt: "虽然不知道你的名字，但真的很感谢。",
    content:
      "下午在实验楼门口资料箱散了一地，有个同学停下来帮我一起捡，还帮我搬到三楼。因为当时太赶，只说了一句谢谢。如果你看到这个帖子，希望你知道这件小事真的帮了我很大的忙。",
    tags: ["感谢", "校园日常"],
    status: "normal",
    replyCount: 2,
    viewCount: 74,
    likeCount: 4,
    collectCount: 1,
    createdAt: "2026-05-26T17:25:00+08:00",
    updatedAt: "2026-05-26T19:00:00+08:00"
  },
  {
    id: 1008,
    boardId: 6,
    authorId: "ywt",
    title: "图书馆勤工助学岗位有人了解吗？",
    excerpt: "想问一下工作时间、主要内容和面试会不会很难。",
    content:
      "看到图书馆最近有勤工助学岗位，时间好像是晚间和周末轮班。我想问一下做过的同学，主要工作是整理书架、前台登记还是协助活动？面试会问哪些问题？如果和课程冲突，能不能提前换班？",
    tags: ["兼职", "勤工助学", "图书馆"],
    status: "normal",
    replyCount: 3,
    viewCount: 69,
    likeCount: 2,
    collectCount: 2,
    createdAt: "2026-05-25T13:50:00+08:00",
    updatedAt: "2026-05-26T09:24:00+08:00"
  },
  {
    id: 1009,
    boardId: 11,
    authorId: "lp",
    title: "捡到一张校园卡，姓李，已交到一食堂前台",
    excerpt: "大概中午十二点半在一食堂门口捡到的。",
    content:
      "今天中午在一食堂门口台阶旁边捡到一张校园卡，卡面姓李。我已经交给一食堂前台了，失主可以带学生证过去认领。如果认识可能丢卡的同学，也麻烦帮忙转告一下。",
    tags: ["失物招领", "校园卡"],
    status: "normal",
    replyCount: 2,
    viewCount: 81,
    likeCount: 3,
    collectCount: 1,
    createdAt: "2026-05-27T12:42:00+08:00",
    updatedAt: "2026-05-27T13:05:00+08:00"
  },
  {
    id: 1010,
    boardId: 12,
    authorId: "xzr",
    title: "今天晚饭吃什么？求推荐不排队窗口",
    excerpt: "连续三天吃同一个窗口了，想换一个不太踩雷的。",
    content:
      "最近晚饭选择困难，想问问大家一食堂和二食堂哪个窗口晚上排队少一点。要求不高，能吃饱、味道稳定、价格别太离谱就行。如果有隐藏菜单也可以推荐一下。",
    tags: ["灌水", "食堂", "推荐"],
    status: "normal",
    replyCount: 4,
    viewCount: 96,
    likeCount: 5,
    collectCount: 1,
    createdAt: "2026-05-27T17:10:00+08:00",
    updatedAt: "2026-05-27T17:45:00+08:00"
  },
  {
    id: 1011,
    boardId: 3,
    authorId: "lsw",
    title: "今天自习室有人把倒计时写满黑板",
    excerpt: "一进门就看到离考试还有多少天，瞬间精神了。",
    content:
      "下午去自习室的时候，看到黑板角落写着离考试还有十几天，旁边还画了一个很严肃的小表情。虽然有点压力，但确实让我少玩了半小时手机。感觉这种小提醒还挺有效。",
    tags: ["校园趣事", "自习室"],
    status: "normal",
    replyCount: 2,
    viewCount: 43,
    likeCount: 3,
    collectCount: 0,
    createdAt: "2026-05-26T15:05:00+08:00",
    updatedAt: "2026-05-26T16:12:00+08:00"
  },
  {
    id: 1012,
    boardId: 9,
    authorId: "ywt",
    title: "大家做课程设计时怎么安排每天进度？",
    excerpt: "想找一种不容易拖到最后两天爆肝的方式。",
    content:
      "以前做课程设计总是前期觉得时间很多，最后两天疯狂补文档和截图。这次想换一种节奏，比如每天固定完成一个小目标：页面、接口、测试、文档分开推进。想听听大家有没有比较实用的时间安排方法。",
    tags: ["课程设计", "时间管理"],
    status: "normal",
    replyCount: 3,
    viewCount: 71,
    likeCount: 4,
    collectCount: 2,
    createdAt: "2026-05-25T21:35:00+08:00",
    updatedAt: "2026-05-26T11:20:00+08:00"
  }
];

export const replies: Reply[] = [
  { id: 1, postId: 1001, authorId: "lp", content: "我也遇到过占位 URL 导致请求一直失败的问题，留空走 mock 这个点很关键。", seat: 1, visible: true, createdAt: "2026-05-27T09:42:00+08:00" },
  { id: 2, postId: 1001, authorId: "ywt", content: "建议把这个写进 README，本地验收的时候能省很多时间。", seat: 2, visible: true, createdAt: "2026-05-27T09:58:00+08:00" },
  { id: 3, postId: 1001, authorId: "lsw", content: "端口占用可以用 dev:win 脚本解决，这个挺适合 Windows。", seat: 3, visible: true, createdAt: "2026-05-27T10:12:00+08:00" },
  { id: 4, postId: 1002, authorId: "xzr", content: "数据库部分我补一份 SQL 练习题，晚上发到评论里。", seat: 1, visible: true, createdAt: "2026-05-26T20:48:00+08:00" },
  { id: 5, postId: 1002, authorId: "lp", content: "软件工程的图可以顺手整理成模板，答辩 PPT 也能直接用。", seat: 2, visible: true, createdAt: "2026-05-26T21:03:00+08:00" },
  { id: 6, postId: 1002, authorId: "lsw", content: "我有一份测试用例表格，等下传到资源区。", seat: 3, visible: true, createdAt: "2026-05-26T22:16:00+08:00" },
  { id: 7, postId: 1002, authorId: "cjy", content: "前端路由那部分可以加一个常见报错清单。", seat: 4, visible: true, createdAt: "2026-05-27T08:16:00+08:00" },
  { id: 8, postId: 1003, authorId: "xzr", content: "先看终端有没有 server action 报错，再看环境变量是否把 Supabase 误配置成占位值。", seat: 1, visible: true, createdAt: "2026-05-27T11:08:00+08:00" },
  { id: 9, postId: 1003, authorId: "lp", content: "浏览器 Network 里看表单提交后的状态码，302 跳转和 500 报错差别很明显。", seat: 2, visible: true, createdAt: "2026-05-27T11:16:00+08:00" },
  { id: 10, postId: 1003, authorId: "zxy", content: "如果是 mock 模式，登录相关功能本身不会真正生效，展示页面没问题。", seat: 3, visible: true, createdAt: "2026-05-27T11:28:00+08:00" },
  { id: 11, postId: 1004, authorId: "ywt", content: "我负责帖子详情和回复区，今晚把空状态也补一下。", seat: 1, visible: true, createdAt: "2026-05-27T08:42:00+08:00" },
  { id: 12, postId: 1004, authorId: "lsw", content: "我看一下私信页面，顺便补几条真实聊天记录。", seat: 2, visible: true, createdAt: "2026-05-27T08:50:00+08:00" },
  { id: 13, postId: 1004, authorId: "zxy", content: "资源区我来整理，按课程、工具、模板分组。", seat: 3, visible: true, createdAt: "2026-05-27T09:05:00+08:00" },
  { id: 14, postId: 1005, authorId: "cjy", content: "我想去，手机也能拍一点花絮。", seat: 1, visible: true, createdAt: "2026-05-26T19:02:00+08:00" },
  { id: 15, postId: 1005, authorId: "xzr", content: "湖边路灯那段很好看，建议带三脚架。", seat: 2, visible: true, createdAt: "2026-05-26T21:10:00+08:00" },
  { id: 16, postId: 1006, authorId: "lp", content: "我可以补位辅助，但可能八点半才能上线。", seat: 1, visible: true, createdAt: "2026-05-27T16:18:00+08:00" },
  { id: 17, postId: 1006, authorId: "ywt", content: "我打中路，娱乐局没压力就行。", seat: 2, visible: true, createdAt: "2026-05-27T16:27:00+08:00" },
  { id: 18, postId: 1006, authorId: "hzy", content: "那就八点半开，先打两把试试配合。", seat: 3, visible: true, createdAt: "2026-05-27T16:38:00+08:00" },
  { id: 19, postId: 1007, authorId: "wxy", content: "这种小事真的很暖，希望那位同学能看到。", seat: 1, visible: true, createdAt: "2026-05-26T18:02:00+08:00" },
  { id: 20, postId: 1007, authorId: "lp", content: "可以发到班群问问，也许很快就能找到。", seat: 2, visible: true, createdAt: "2026-05-26T19:00:00+08:00" },
  { id: 21, postId: 1008, authorId: "zxy", content: "我同学做过，主要是整理书和简单登记，面试不难。", seat: 1, visible: true, createdAt: "2026-05-25T14:20:00+08:00" },
  { id: 22, postId: 1008, authorId: "lsw", content: "换班一般要提前说，别临时缺岗就行。", seat: 2, visible: true, createdAt: "2026-05-25T16:44:00+08:00" },
  { id: 23, postId: 1008, authorId: "xzr", content: "可以准备一个简短自我介绍，说明自己时间稳定。", seat: 3, visible: true, createdAt: "2026-05-26T09:24:00+08:00" },
  { id: 24, postId: 1009, authorId: "ywt", content: "我帮你转到年级群了。", seat: 1, visible: true, createdAt: "2026-05-27T12:50:00+08:00" },
  { id: 25, postId: 1009, authorId: "cjy", content: "失主刚刚说已经去拿了，谢谢。", seat: 2, visible: true, createdAt: "2026-05-27T13:05:00+08:00" },
  { id: 26, postId: 1010, authorId: "wxy", content: "二食堂砂锅窗口排队少一点，味道也还稳。", seat: 1, visible: true, createdAt: "2026-05-27T17:18:00+08:00" },
  { id: 27, postId: 1010, authorId: "hzy", content: "一食堂烤盘饭可以，六点前去基本不用排很久。", seat: 2, visible: true, createdAt: "2026-05-27T17:24:00+08:00" },
  { id: 28, postId: 1010, authorId: "lp", content: "别去太晚，晚了只剩几个固定窗口。", seat: 3, visible: true, createdAt: "2026-05-27T17:33:00+08:00" },
  { id: 29, postId: 1010, authorId: "lsw", content: "我投二食堂面窗口，速度快。", seat: 4, visible: true, createdAt: "2026-05-27T17:45:00+08:00" },
  { id: 30, postId: 1011, authorId: "ywt", content: "这种提醒比手机倒计时有效多了，抬头就能看到。", seat: 1, visible: true, createdAt: "2026-05-26T15:40:00+08:00" },
  { id: 31, postId: 1011, authorId: "zxy", content: "压力到了，但也确实该开始复习了。", seat: 2, visible: true, createdAt: "2026-05-26T16:12:00+08:00" },
  { id: 32, postId: 1012, authorId: "xzr", content: "建议每天留一个能验收的小结果，比如一个页面或一个接口。", seat: 1, visible: true, createdAt: "2026-05-25T22:02:00+08:00" },
  { id: 33, postId: 1012, authorId: "lp", content: "文档不要最后写，每天把当天改动记两三句就够了。", seat: 2, visible: true, createdAt: "2026-05-26T08:45:00+08:00" },
  { id: 34, postId: 1012, authorId: "cjy", content: "我会把截图单独存一个文件夹，答辩前不用到处找。", seat: 3, visible: true, createdAt: "2026-05-26T11:20:00+08:00" }
];

export const friendships: FriendshipItem[] = [
  { id: 1, requesterId: "ywt", addresseeId: "xzr", status: "accepted", createdAt: "2026-05-24T09:55:00+08:00" },
  { id: 2, requesterId: "lp", addresseeId: "xzr", status: "accepted", createdAt: "2026-05-24T10:30:00+08:00" },
  { id: 3, requesterId: "lsw", addresseeId: "xzr", status: "accepted", createdAt: "2026-05-25T19:30:00+08:00" },
  { id: 4, requesterId: "zxy", addresseeId: "xzr", status: "pending", createdAt: "2026-05-27T08:12:00+08:00" }
];

export const messages: Message[] = [
  { id: 1, peerId: "lp", fromSelf: false, content: "xzr，首页数据我看过了，点赞数现在真实多了。", unread: 0, createdAt: "2026-05-27T10:20:00+08:00" },
  { id: 2, peerId: "lp", fromSelf: true, content: "好，我再把帖子内容按板块补得自然一点。", unread: 0, createdAt: "2026-05-27T10:24:00+08:00" },
  { id: 3, peerId: "ywt", fromSelf: false, content: "登录页如果没接 Supabase，是不是只能看展示数据？", unread: 1, createdAt: "2026-05-27T11:18:00+08:00" },
  { id: 4, peerId: "ywt", fromSelf: true, content: "对，mock 模式先看页面；等 Docker 配好再用真实账号登录。", unread: 0, createdAt: "2026-05-27T11:23:00+08:00" },
  { id: 5, peerId: "lsw", fromSelf: false, content: "我补了几条求助问答的回复，你看看语气够不够像同学聊天。", unread: 1, createdAt: "2026-05-27T13:05:00+08:00" },
  { id: 6, peerId: "lsw", fromSelf: true, content: "可以，别太官方，像真实论坛就行。", unread: 0, createdAt: "2026-05-27T13:12:00+08:00" },
  { id: 7, peerId: "zxy", fromSelf: false, content: "资源区我想放复习资料和 PPT 模板，标题要不要更具体？", unread: 0, createdAt: "2026-05-26T21:40:00+08:00" },
  { id: 8, peerId: "zxy", fromSelf: true, content: "具体一点好，别人搜索的时候更容易找到。", unread: 0, createdAt: "2026-05-26T21:46:00+08:00" }
];

export const notifications: NotificationItem[] = [
  { id: 1, type: "reply", title: "你的主题有新回复", description: "lp 回复了《Next.js 项目本地运行时，环境变量应该怎么配？》", read: false, createdAt: "2026-05-27T09:42:00+08:00" },
  { id: 2, type: "friend", title: "新的好友申请", description: "zxy 想添加你为好友", read: false, createdAt: "2026-05-27T08:12:00+08:00" },
  { id: 3, type: "system", title: "演示数据已更新", description: "论坛已切换为中文真实互动数据，包含帖子、回复、私信和通知。", read: true, createdAt: "2026-05-27T10:00:00+08:00" },
  { id: 4, type: "report", title: "举报已处理", description: "你提交的资源链接失效问题已被标记为已处理。", read: true, createdAt: "2026-05-26T18:20:00+08:00" }
];

export const reports: ReportItem[] = [
  { id: 1, postId: 1002, reason: "资源链接里有一个网盘地址打不开，需要重新补。", status: "resolved", createdAt: "2026-05-26T18:12:00+08:00" },
  { id: 2, postId: 1003, reason: "问题描述一开始不够完整，建议补充环境信息。", status: "pending", createdAt: "2026-05-27T11:12:00+08:00" }
];

export const stats = {
  users: profiles.length,
  posts: posts.length,
  replies: replies.length,
  online: 6,
  todayPosts: boards.reduce((sum, board) => sum + board.todayCount, 0)
};
