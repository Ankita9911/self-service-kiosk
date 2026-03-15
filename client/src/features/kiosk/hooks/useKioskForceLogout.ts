import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { getSocketUrl } from "@/shared/lib/socket";
import { clearKioskSession, getKioskToken } from "@/shared/lib/kioskSession";

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
      // silently ignore
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);
}
