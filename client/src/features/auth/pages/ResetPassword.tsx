import { useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import PasswordStrength from "../components/PasswordStrength";
import { PasswordField } from "../components/PasswordField";
import { useResetPassword } from "../hooks/useResetPassword";

export function ResetPassword() {
  const navigate = useNavigate();

  const {
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
  } = useResetPassword(() => navigate("/"));

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <LockKeyhole className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[11px] font-clash-semibold text-indigo-500 uppercase tracking-widest">
            Security
          </span>
        </div>
        <h1 className="text-[28px] font-clash-bold text-slate-900 dark:text-white tracking-tight">
          Change Password
        </h1>
        <p className="text-sm font-satoshi text-slate-500 dark:text-slate-400 mt-0.5">
          Update your account password.
        </p>
      </div>

      {success ? (
        <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm p-8 text-center space-y-4 animate-scale-in">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="font-clash-bold text-slate-900 dark:text-white text-lg">
              Password Updated!
            </p>
            <p className="font-satoshi text-slate-500 dark:text-slate-400 text-sm mt-1">
              Redirecting you back to the dashboard…
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-linear-to-r from-indigo-500 to-violet-600" />
          <div className="p-7 space-y-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="space-y-5"
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
                  <p className="text-sm font-satoshi text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-clash-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="flex-1 h-11 rounded-xl bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-clash-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Updating…
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
