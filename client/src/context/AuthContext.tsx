import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/services/axiosInstance";
import type { User } from "@/types/user.types";
import type { LoginResponse } from "@/types/auth.types";

export interface AuthContextType {
  user: (User & { mustChangePassword?: boolean }) | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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

      // Sync axios header
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  /* =========================================
     LOGIN
  ========================================= */
  const login = async (email: string, password: string) => {
    const response = await axios.post<{ data: LoginResponse }>(
      "/auth/login",
      { email, password }
    );

    const { token, user, mustChangePassword } =
      response.data.data;

    // Save token
    localStorage.setItem("token", token);

    // Sync axios header
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;

    const enrichedUser = {
      ...user,
      mustChangePassword,
    };

    localStorage.setItem("user", JSON.stringify(enrichedUser));

    setUser(enrichedUser);

    // 🔐 Force reset redirect
    if (mustChangePassword) {
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
      value={{ user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
