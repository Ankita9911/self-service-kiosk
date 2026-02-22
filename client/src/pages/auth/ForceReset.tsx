// ═══════════════════════════════════════
//  ForceReset.tsx
// ═══════════════════════════════════════
import { useState } from "react";
import axios from "@/shared/lib/axiosInstance";
import { useNavigate } from "react-router-dom";
import useAuth from "@/shared/hooks/useAuth";
import {
  LockKeyhole, Eye, EyeOff, ShieldCheck, Loader2,
  ChefHat, ArrowRight, AlertCircle, CheckCircle2, LogOut,
} from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const strength = score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  const textColors = ["text-red-500", "text-orange-500", "text-yellow-600", "text-emerald-600"];

  if (!password) return null;

  return (
    <div className="space-y-2.5 animate-fade-in">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`flex items-center gap-1 text-[11px] font-satoshi transition-colors ${
                c.pass ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <CheckCircle2 className={`w-3 h-3 ${c.pass ? "opacity-100" : "opacity-30"}`} />
              {c.label}
            </span>
          ))}
        </div>
        <span className={`text-[11px] font-clash-semibold ${textColors[score - 1] || "text-slate-400"}`}>
          {strength}
        </span>
      </div>
    </div>
  );
}

export function ForceReset() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const mismatch = confirm.length > 0 && password !== confirm;
  const isValid = currentPassword.length > 0 && password.length >= 8 && password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setError("");
    setLoading(true);
    try {
      await axios.post("/auth/force-reset-password", { currentPassword, password });
      logout();
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.error?.message ?? "Failed to update password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle bg glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-50/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden">
          {/* Top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-orange-600" />

          <div className="p-8 space-y-6">
            {/* Icon + heading */}
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-[22px] font-clash-bold text-slate-900 tracking-tight">
                  Set New Password
                </h2>
                <p className="text-sm font-satoshi text-slate-500 mt-1">
                  Your account requires a password change before you can continue.
                </p>
              </div>
            </div>

            {/* Alert */}
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-satoshi text-amber-700 leading-relaxed">
                After setting a new password, you'll be redirected to log in again with your new credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current password */}
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
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
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
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              {/* Confirm password */}
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
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mismatch && (
                  <p className="text-[12px] font-satoshi text-red-500 flex items-center gap-1.5 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Passwords don't match
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-satoshi text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !isValid}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                  : <><ArrowRight className="w-4 h-4" /> Update Password</>}
              </button>
            </form>

            {/* Sign out link */}
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                onClick={() => { logout(); navigate("/login", { replace: true }); }}
                className="flex items-center gap-2 text-sm font-satoshi text-slate-400 hover:text-red-500 transition-colors mx-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out instead
              </button>
            </div>
          </div>
        </div>

        {/* Branding footer */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <ChefHat className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-clash-semibold text-slate-400">Hyper Kitchen · Admin Portal</span>
        </div>
      </div>
    </div>
  );
}