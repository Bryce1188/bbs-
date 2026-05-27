type RealtimeEvent = "message:new" | "notification:new" | "notification:read";

type IOShape = {
  to: (room: string) => { emit: (event: RealtimeEvent, payload: Record<string, unknown>) => void };
};

declare global {
  var __bbsIo: IOShape | undefined;
}

export function emitToUser(userId: string, event: RealtimeEvent, payload: Record<string, unknown> = {}) {
  if (!globalThis.__bbsIo) return;
  globalThis.__bbsIo.to(`user:${userId}`).emit(event, payload);
}
