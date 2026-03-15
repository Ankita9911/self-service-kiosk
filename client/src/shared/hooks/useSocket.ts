import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getSocketUrl } from "@/shared/lib/socket";
import type { Order, OrderStatus } from "@/features/kiosk/types/order.types";

interface OrderStatusPayload {
  orderId: string;
  status: OrderStatus;
  order: Order;
}

export function useSocket(
  onOrderNew: (order: Order) => void,
  onOrderStatusUpdated: (payload: OrderStatusPayload) => void
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(getSocketUrl(), {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("order:new", onOrderNew);
    socket.on("order:statusUpdated", onOrderStatusUpdated);
    socket.on("connect_error", () => {});

    return () => { socket.disconnect(); };
  }, []);

  return socketRef;
}
