import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { getSocketUrl } from "@/shared/lib/socket";

interface LowStockPayload {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  minThreshold: number;
  message: string;
}

export function useLowStockAlert(outletId?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(getSocketUrl(), {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("ingredient:lowStock", (data: LowStockPayload) => {
      toast.error(data.message || `Low stock: ${data.ingredientName}`, {
        duration: 8000,
        id: `low-stock-${data.ingredientId}`,
      });
    });

    socket.on("connect_error", () => {});

    return () => { socket.disconnect(); };
  }, [outletId]);

  return socketRef;
}
