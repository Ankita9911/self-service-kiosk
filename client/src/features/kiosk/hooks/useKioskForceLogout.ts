import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { clearKioskSession, getKioskToken } from "@/shared/lib/kioskSession";

function getSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiUrl) return "http://localhost:3000";
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:3000";
  }
}

/**
 * Opens a dedicated socket connection authenticated with the kiosk device token
 * and listens for `force:logout`. When received, clears the kiosk session and
 * redirects to the kiosk login page.
 */
export function useKioskForceLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getKioskToken();
    if (!token) return;

    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("force:logout", () => {
      clearKioskSession();
      toast.error("This device has been deactivated.");
      navigate("/kiosk/login", { replace: true });
    });

    socket.on("connect_error", () => {
      // silently ignore connection errors
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);
}
