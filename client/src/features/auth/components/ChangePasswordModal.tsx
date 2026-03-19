import { useState } from "react";
import {
  LockKeyhole,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import PasswordStrength from "./PasswordStrength";
import { PasswordField } from "./PasswordField";
import { forceResetPassword } from "../services/auth.service";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;
  const isValid =
    currentPassword.length > 0 &&
    password.length >= 8 &&
    password === confirm &&
    password !== currentPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setError("");
    setLoading(true);

    try {
      await forceResetPassword({ currentPassword, password });
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => {
        onClose();
        setCurrentPassword("");
        setPassword("");
        setConfirm("");
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error?.message ??
        "Failed to update password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      <div className="relative bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="h-0.5 bg-linear-to-r from-indigo-400 via-indigo-500 to-violet-500" />

        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-white/6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
              <LockKeyhole className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Change Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your account password
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose()}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                Password Updated!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your password has been changed successfully.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="px-6 pb-6 pt-5 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]"
            noValidate
          >
            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter your current password"
              required
            />

            <div className="space-y-1.5">
              <PasswordField
                label="New Password"
                value={password}
                onChange={setPassword}
                placeholder="Create a strong password"
                required
              />
              <PasswordStrength password={password} />
            </div>

            <PasswordField
              label="Confirm Password"
              value={confirm}
              onChange={setConfirm}
              placeholder="Repeat your new password"
              required
              error={mismatch ? "Passwords don't match" : undefined}
            />

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => !loading && onClose()}
                disabled={loading}
                className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isValid}
                className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating…
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
