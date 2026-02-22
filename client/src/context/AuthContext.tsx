import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/shared/lib/axiosInstance";
import type { User } from "@/shared/types/user.types";

export interface AuthContextType {
  user: (User & { mustChangePassword?: boolean }) | null;
  loading: boolean;
  setSession: (token: string, user: any) => void;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<
    (User & { mustChangePassword?: boolean }) | null
  >(null);

  const [loading, setLoading] = useState(true);

  /* =========================================
     INITIAL LOAD
  ========================================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      axios.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  /* =========================================
     SET SESSION (NEW)
  ========================================= */
  const setSession = (token: string, userData: any) => {
    localStorage.setItem("token", token);

    axios.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;

    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);

    // 🔐 Handle redirect centrally
    if (userData?.mustChangePassword) {
      navigate("/force-reset");
    } else {
      navigate("/");
    }
  };

  /* =========================================
     LOGOUT
  ========================================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete axios.defaults.headers.common["Authorization"];

    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, setSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}