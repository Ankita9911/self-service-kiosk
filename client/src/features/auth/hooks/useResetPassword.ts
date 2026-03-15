import { useState } from "react";
import { forceResetPassword } from "../services/auth.service";

export function useResetPassword(onSuccess: () => void) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  const isValid =
    currentPassword.length > 0 && password.length >= 8 && password === confirm;

  const submit = async () => {
    if (!isValid) return;

    setError("");
    setLoading(true);

    try {
      await forceResetPassword({ currentPassword, password });
      setSuccess(true);
      setTimeout(onSuccess, 1800);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ?? "Failed to update password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    currentPassword,
    setCurrentPassword,
    password,
    setPassword,
    confirm,
    setConfirm,
    loading,
    error,
    success,
    mismatch,
    isValid,
    submit,
  };
}
