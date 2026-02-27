import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

function getSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiUrl) return "http://localhost:3000";
  try {
    return new URL(apiUrl).origin; // strips /api — socket.io lives at the root
  } catch {
    return "http://localhost:3000";
  }
}

const SOCKET_URL = getSocketUrl();

/**
 * Listens for `menu:updated` socket events emitted by the queue worker.
 *
 * - Kiosk devices have outletId in their JWT → auto-joined on connect.
 * - Admin users (FRANCHISE_ADMIN / SUPER_ADMIN) may have outletId: null in
 *   their JWT, so pass the explicit `outletId` they are currently viewing and
 *   this hook will emit `join:outlet` to subscribe to the right room.
 *
 * @param onRefresh  - callback to re-fetch menu data
 * @param outletId   - the outlet being viewed (required for admin users)
 */
export function useMenuSocket(onRefresh: () => void, outletId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const token =
      localStorage.getItem("kiosk_token") || localStorage.getItem("token");

    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // If an explicit outletId is provided (admin viewing a specific outlet),
      // request to join that outlet's room
      if (outletId) {
        socket.emit("join:outlet", outletId);
      }
    });

    socket.on("menu:updated", () => {
      onRefreshRef.current();
    });

    socket.on("connect_error", (err) => {
      console.warn("[menuSocket] connect error:", err.message);
    });

    return () => {
      if (outletId) {
        socket.emit("leave:outlet", outletId);
      }
      socket.disconnect();
    };
  }, [outletId]);

  return socketRef;
}

