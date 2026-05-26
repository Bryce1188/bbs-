"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type Locale = "zh-CN" | "en-US";

const dictionaries: Record<Locale, Record<string, string>> = {
  "zh-CN": {
    home: "首页",
    boards: "板块",
    rankings: "排行榜",
    messages: "私信",
    admin: "后台",
    guide: "引导",
    publish: "发帖",
    search: "搜索",
    notifications: "通知",
    footerSummary: "默认中文、多语言可切换。当前课程版使用本地 MySQL 和 WebSocket。",
    userGuide: "用户指导",
    homeBadge: "纯本地 MySQL + WebSocket 课程版",
    homeTitle: "BBS 星桥社区",
    homeLead: "企业 BBS 的本地课程实现：用户、板块、帖子、回复、排行榜、私信和后台管理全部接入本地 MySQL。",
    browseBoards: "浏览板块",
    viewGuide: "查看用户指导",
    registeredUsers: "注册用户",
    totalPosts: "主题总数",
    todayPosts: "今日发帖",
    onlineMembers: "在线成员",
    activeBoards: "活跃板块",
    allBoards: "全部板块",
    featuredPosts: "精选主题",
    searchContent: "搜索内容",
    courseDeploySplitTitle: "课程验收本地闭环",
    courseDeploySplitText: "当前版本不依赖云端，使用本地 MySQL、Server Actions 和 WebSocket 完成登录、注册、帖子、回复、私信与后台管理。",
    openAdmin: "进入后台管理",
    tourStepHeatTitle: "观察社区热度",
    tourStepHeatText: "首页展示今日发帖、活跃板块和精选主题，适合作为答辩展示入口。",
    tourStepBoardTitle: "进入板块路径",
    tourStepBoardText: "板块页按讨论场景组织，支持搜索、筛选、标签和帖子列表。",
    tourStepMessageTitle: "体验私信与通知",
    tourStepMessageText: "私信通过本地 WebSocket 实时推送，消息持久化到 MySQL。",
    tourStepAdminTitle: "后台完整管理",
    tourStepAdminText: "后台覆盖用户、角色、板块、帖子、评论、举报、公告和日志。",
    skip: "跳过",
    finish: "完成",
    next: "下一步",
    closeGuide: "关闭引导"
  },
  "en-US": {
    home: "Home",
    boards: "Boards",
    rankings: "Rankings",
    messages: "Messages",
    admin: "Admin",
    guide: "Guide",
    publish: "Publish",
    search: "Search",
    notifications: "Notifications",
    footerSummary: "Chinese is the default language. This course build uses local MySQL and WebSocket.",
    userGuide: "User guide",
    homeBadge: "Local MySQL + WebSocket course build",
    homeTitle: "BBS Starbridge Community",
    homeLead: "A local enterprise BBS course build with users, boards, posts, replies, rankings, messages, and admin workflows backed by MySQL.",
    browseBoards: "Browse boards",
    viewGuide: "View guide",
    registeredUsers: "Users",
    totalPosts: "Posts",
    todayPosts: "Today",
    onlineMembers: "Online",
    activeBoards: "Active boards",
    allBoards: "All boards",
    featuredPosts: "Featured posts",
    searchContent: "Search content",
    courseDeploySplitTitle: "Local course acceptance workflow",
    courseDeploySplitText: "This build does not require cloud services. Local MySQL, Server Actions, and WebSocket cover auth, posts, replies, messages, and admin management.",
    openAdmin: "Open admin",
    tourStepHeatTitle: "Read community activity",
    tourStepHeatText: "The home page highlights today's posts, active boards, and selected topics for presentation demos.",
    tourStepBoardTitle: "Enter board flows",
    tourStepBoardText: "Board pages organize discussions by scenario with search, sorting, tags, and post lists.",
    tourStepMessageTitle: "Try messages and notifications",
    tourStepMessageText: "Messages are pushed through local WebSocket and persisted in MySQL.",
    tourStepAdminTitle: "Manage the full backend",
    tourStepAdminText: "Admin covers users, roles, boards, posts, comments, reports, notices, and audit logs.",
    skip: "Skip",
    finish: "Finish",
    next: "Next",
    closeGuide: "Close guide"
  }
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children, initialLocale = "zh-CN" }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  function setLocale(nextLocale: Locale) {
    document.cookie = `bbs-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem("bbs-locale", nextLocale);
    setLocaleState(nextLocale);
  }

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem("bbs-locale", locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string) => dictionaries[locale][key] ?? key
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}

export function LocaleText({ id }: { id: string }) {
  const { t } = useI18n();
  return t(id);
}
