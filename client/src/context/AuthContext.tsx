import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/shared/lib/axiosInstance";
import { io, Socket } from "socket.io-client";
import type { User } from "@/features/users/types/user.types";

export interface AuthContextType {
  user: (User & { mustChangePassword?: boolean }) | null;
  loading: boolean;
  setSession: (user: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function getSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiUrl) return "http://localhost:3000";
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isKioskRoute = window.location.pathname.startsWith("/kiosk");

  const [user, setUser] = useState<
    (User & { mustChangePassword?: boolean }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  const doLogout = async (redirect = true) => {
    try {
      await axios.post("/auth/logout");
    } catch {
      // ignore errors — cookie will still be cleared by the server
    }
    localStorage.removeItem("user");
    setUser(null);
    socketRef.current?.disconnect();
    socketRef.current = null;
    if (redirect && !window.location.pathname.startsWith("/kiosk")) {
      navigate("/login");
    }
  };

  // Subscribe to force:logout from the server (user/device deactivated)
  const connectForceLogoutSocket = () => {
    // Use cookie-authenticated socket — no token in handshake needed
    const socket = io(getSocketUrl(), {
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("force:logout", () => {
      doLogout(true);
    });

    socket.on("connect_error", () => {
      // silently ignore — user may have already logged out
    });
  };

  useEffect(() => {
    if (isKioskRoute) {
      // Kiosk routes are independent from admin session auth checks.
      setLoading(false);
      return;
    }

    // Restore user state from localStorage (just profile, not token)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      connectForceLogoutSocket();
    } else {
      // Try to restore session from the cookie via /auth/me
      axios
        .get("/auth/me")
        .then((res) => {
          const u = res.data?.data?.user;
          if (u) {
            setUser(u);
            localStorage.setItem("user", JSON.stringify(u));
            connectForceLogoutSocket();
          }
        })
        .catch(() => {
          // No valid cookie — stay logged out
        });
    }
    setLoading(false);

    // Listen for 401/403 from axiosInstance interceptor
    const handleAxiosLogout = () => {
      if (window.location.pathname.startsWith("/kiosk")) {
        doLogout(false);
        return;
      }
      doLogout(true);
    };
    window.addEventListener("auth:logout", handleAxiosLogout);

    return () => {
      window.removeEventListener("auth:logout", handleAxiosLogout);
      socketRef.current?.disconnect();
    };
  }, [isKioskRoute]);

  const setSession = (userData: any) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    connectForceLogoutSocket();
    if (userData?.mustChangePassword) {
      navigate("/force-reset");
    } else {
      navigate("/");
    }
  };

  const logout = () => doLogout(true);

  return (
    <AuthContext.Provider
      value={{ user, loading, setSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
