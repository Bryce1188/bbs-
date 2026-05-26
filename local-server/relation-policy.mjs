export const RELATION_LEVELS = {
  BLOCKED: 0,
  STRANGER: 1,
  FOLLOWING: 2,
  MUTUAL: 3,
  FRIEND: 4,
  CLOSE: 5
};

const DEFAULT_RELATIONS = [
  { a: "admin", b: "xuzirui", level: RELATION_LEVELS.FRIEND },
  { a: "xuzirui", b: "yaowentao", level: RELATION_LEVELS.FRIEND },
  { a: "xuzirui", b: "luojunjie", level: RELATION_LEVELS.MUTUAL }
];

export function relationKey(a, b) {
  return [a, b].sort().join(":");
}

export function seedRelations() {
  return DEFAULT_RELATIONS.map((item) => ({ ...item, key: relationKey(item.a, item.b) }));
}

export function getRelationLevel(data, a, b) {
  if (!a || !b) return RELATION_LEVELS.BLOCKED;
  if (a === b) return RELATION_LEVELS.CLOSE;

  const key = relationKey(a, b);
  const relation = (data.relations ?? []).find((item) => item.key === key || relationKey(item.a, item.b) === key);
  return relation?.level ?? RELATION_LEVELS.STRANGER;
}

export function canSendMessage(data, senderId, receiverId, content) {
  const message = String(content ?? "").trim();
  const level = getRelationLevel(data, senderId, receiverId);
  const sender = (data.profiles ?? []).find((item) => item.id === senderId);
  const isPrivileged = sender?.role === "admin" || sender?.role === "moderator";

  if (!senderId || !receiverId || senderId === receiverId) {
    return { ok: false, level, code: "invalid_peer", message: "请选择有效的聊天对象。" };
  }
  if (!message || message.length > 2000) {
    return { ok: false, level, code: "invalid_content", message: "消息不能为空，且不能超过 2000 字。" };
  }
  if (level === RELATION_LEVELS.BLOCKED) {
    return { ok: false, level, code: "blocked", message: "当前关系等级禁止聊天。" };
  }
  if (/(https?:\/\/|www\.)/i.test(message) && level < RELATION_LEVELS.MUTUAL && !isPrivileged) {
    return { ok: false, level, code: "link_limited", message: "L3 互相关注及以上才允许发送链接。" };
  }
  if (level === RELATION_LEVELS.STRANGER && !isPrivileged) {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const existingCount = (data.messages ?? []).filter(
      (item) => item.senderId === senderId && item.receiverId === receiverId
    ).length;
    if (existingCount >= 1) {
      return { ok: false, level, code: "stranger_limit", message: "L1 陌生人只允许发送一条打招呼消息。" };
    }

    const receiverHasReplied = (data.messages ?? []).some(
      (item) => item.senderId === receiverId && item.receiverId === senderId
    );
    const directionalCount = (data.messages ?? []).filter(
      (item) => item.senderId === senderId && item.receiverId === receiverId && new Date(item.createdAt).getTime() >= since
    ).length;
    if (!receiverHasReplied && directionalCount > 0) {
      return { ok: false, level, code: "wait_reply", message: "对方回复前，24 小时内不能连续私信陌生人。" };
    }

    const contactedStrangers = new Set(
      (data.messages ?? [])
        .filter((item) => item.senderId === senderId && new Date(item.createdAt).getTime() >= since)
        .filter((item) => getRelationLevel(data, senderId, item.receiverId) === RELATION_LEVELS.STRANGER)
        .filter((item) => !(data.messages ?? []).some((reply) => reply.senderId === item.receiverId && reply.receiverId === senderId))
        .map((item) => item.receiverId)
    );
    if (!contactedStrangers.has(receiverId) && contactedStrangers.size >= 5) {
      return { ok: false, level, code: "stranger_daily_limit", message: "24 小时内最多主动联系 5 位未回复的陌生人。" };
    }
  }

  return { ok: true, level };
}
