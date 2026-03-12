import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";

function getSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiUrl) return "http://localhost:3000";
  try {
    return new URL(apiUrl as string).origin;
  } catch {
    return "http://localhost:3000";
  }
}

const SOCKET_URL = getSocketUrl();

/**
 * Listens for `ingredient:lowStock` socket events and shows a toast when
 * any ingredient drops below its minimum threshold.
 *
 * Mount this once in the app layout so all admin/manager views receive alerts.
 */
export function useLowStockAlert() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("ingredient:lowStock", (data: {
      ingredientId: string;
      ingredientName: string;
      currentStock: number;
      minThreshold: number;
      message: string;
    }) => {
      toast.error(data.message || `Low stock: ${data.ingredientName}`, {
        duration: 8000,
        id: `low-stock-${data.ingredientId}`,
      });
    });

    socket.on("connect_error", (err) => {
      console.warn("[lowStockSocket] connect error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
