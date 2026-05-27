"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getRealtimeSocket() {
  if (socket) return socket;
  socket = io({
    path: "/socket.io",
    transports: ["websocket", "polling"]
  });
  return socket;
}
