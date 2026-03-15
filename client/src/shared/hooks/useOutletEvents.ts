import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getKioskToken } from "@/shared/lib/kioskSession";
import { getSocketUrl } from "@/shared/lib/socket";

const SOCKET_URL = getSocketUrl();

export function useOutletEvents(
  events: string[],
  onEvent: () => void,
  outletId?: string
) {
  const socketRef = useRef<Socket | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const kioskToken = getKioskToken();
    const socket = io(
      SOCKET_URL,
      kioskToken
        ? { auth: { token: kioskToken }, transports: ["websocket"] }
        : { withCredentials: true, transports: ["websocket"] }
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      if (outletId) {
        socket.emit("join:outlet", outletId);
      }
    });

    events.forEach((eventName) => {
      socket.on(eventName, () => {
        onEventRef.current();
      });
    });

    socket.on("connect_error", (err) => {
      console.warn("[outletEvents] connect error:", err.message);
    });

    return () => {
      events.forEach((eventName) => {
        socket.off(eventName);
      });
      if (outletId) {
        socket.emit("leave:outlet", outletId);
      }
      socket.disconnect();
    };
  }, [events, outletId]);

  return socketRef;
}
