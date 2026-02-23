import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/shared/hooks/useAuth";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  ChefHat,
  ArrowRight,
  AlertCircle,
  LogOut,
} from "lucide-react";
import PasswordStrength from "../components/PasswordStrength";
import { useForceReset } from "../hooks/useForceReset";

export function ForceReset() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    currentPassword,
    setCurrentPassword,
    password,
    setPassword,
    confirm,
    setConfirm,
    loading,
    error,
    mismatch,
    isValid,
    submit,
  } = useForceReset(() => {
    logout();
    navigate("/login", { replace: true });
  });
  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-50/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-orange-600" />

          <div className="p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-[22px] font-clash-bold text-slate-900 tracking-tight">
                  Set New Password
                </h2>
                <p className="text-sm font-satoshi text-slate-500 mt-1">
                  Your account requires a password change before you can
                  continue.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-satoshi text-amber-700 leading-relaxed">
                After setting a new password, you'll be redirected to log in
                again with your new credentials.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
                  Current Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm font-satoshi text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrent ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    minLength={8}
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm font-satoshi text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    className={`w-full h-11 pl-10 pr-10 rounded-xl border bg-slate-50 text-sm font-satoshi text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      mismatch
                        ? "border-red-300 focus:ring-red-400/40 focus:border-red-400"
                        : "border-slate-200 focus:ring-orange-400/40 focus:border-orange-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {mismatch && (
                  <p className="text-[12px] font-satoshi text-red-500 flex items-center gap-1.5 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Passwords don't match
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-satoshi text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isValid}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
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
            </form>
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
                className="flex items-center gap-2 text-sm font-satoshi text-slate-400 hover:text-red-500 transition-colors mx-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out instead
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <ChefHat className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-clash-semibold text-slate-400">
            Hyper Kitchen · Admin Portal
          </span>
        </div>
      </div>
    </div>
  );
}
