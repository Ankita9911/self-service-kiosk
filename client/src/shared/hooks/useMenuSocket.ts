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
 * - Kiosk devices pass their device token explicitly via `auth` (device JWT
 *   is stored in localStorage as `kiosk_token`).
 * - Authenticated admin/staff users rely on the httpOnly cookie
 *   (`withCredentials: true`) — no token in JS land.
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
    // Kiosk devices still carry their device JWT in localStorage
    const kioskToken = localStorage.getItem("kiosk_token");

    const socketOptions = kioskToken
      ? { auth: { token: kioskToken }, transports: ["websocket"] }
      : { withCredentials: true, transports: ["websocket"] };

    const socket = io(SOCKET_URL, socketOptions);

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

