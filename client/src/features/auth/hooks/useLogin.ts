import { useState } from "react";
import { loginRequest } from "../services/auth.service";
import useAuth from "@/shared/hooks/useAuth";

export function useLogin() {
  const { setSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email || !password) return;

    setError("");
    setLoading(true);

    try {
      const { token, user, mustChangePassword } =
        await loginRequest(email, password);

      const enrichedUser = {
        ...user,
        mustChangePassword,
      };

      setSession(token, enrichedUser);
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    submit,
  };
}