import { useState } from "react";
import { loginRequest } from "../services/auth.service";
import useAuth from "@/shared/hooks/useAuth";
import { loginSchema } from "../validations/auth.schemas";

export function useLogin() {
  const { setSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function clearFieldError(field: "email" | "password") {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const submit = async () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errs: { email?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as "email" | "password";
        if (!errs[key]) errs[key] = issue.message;
      });
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setError("");
    setLoading(true);

    try {
      const { token, user, mustChangePassword } = await loginRequest(
        result.data.email,
        password
      );
      const enrichedUser = { ...user, mustChangePassword };
      setSession(token, enrichedUser);
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail: (v: string) => { setEmail(v); clearFieldError("email"); },
    password,
    setPassword: (v: string) => { setPassword(v); clearFieldError("password"); },
    loading,
    error,
    fieldErrors,
    submit,
  };
}