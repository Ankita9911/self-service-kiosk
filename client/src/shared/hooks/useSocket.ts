import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getSocketUrl } from "@/shared/lib/socket";

const SOCKET_URL = getSocketUrl();

export function useSocket(
  onOrderNew: (order: any) => void,
  onOrderStatusUpdated: (payload: any) => void
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
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
  }, []);

  return socketRef;
}
