import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function useSocket(onOrderNew: (order: any) => void, onOrderStatusUpdated: (payload: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("order:new", (order) => {
      onOrderNew(order);
    });

    socket.on("order:statusUpdated", (payload) => {
      onOrderStatusUpdated(payload);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connect error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef;
}