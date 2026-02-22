
import { useState } from "react";
import axios from "@/services/axiosInstance";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
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
export function ResetPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const mismatch = confirm.length > 0 && password !== confirm;
  const isValid = currentPassword.length > 0 && password.length >= 8 && password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setError("");
    setLoading(true);
    try {
      await axios.post("/auth/force-reset-password", { currentPassword, password });
      setSuccess(true);
      setTimeout(() => navigate("/"), 1800);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error?.message ?? "Failed to update password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <LockKeyhole className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-[11px] font-clash-semibold text-orange-500 uppercase tracking-widest">Security</span>
        </div>
        <h1 className="text-[28px] font-clash-bold text-slate-900 tracking-tight">Change Password</h1>
        <p className="text-sm font-satoshi text-slate-500 mt-0.5">Update your account password.</p>
      </div>

      {/* Success state */}
      {success ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4 animate-scale-in">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="font-clash-bold text-slate-900 text-lg">Password Updated!</p>
            <p className="font-satoshi text-slate-500 text-sm mt-1">Redirecting you back to the dashboard…</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-orange-600" />
          <div className="p-7 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  <button type="button" onClick={() => setShowCurrent((v) => !v)} tabIndex={-1} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
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
                  <button type="button" onClick={() => setShowPw((v) => !v)} tabIndex={-1} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              {/* Confirm */}
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
                    placeholder="Repeat your new password"
                    required
                    className={`w-full h-11 pl-10 pr-10 rounded-xl border bg-slate-50 text-sm font-satoshi text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      mismatch
                        ? "border-red-300 focus:ring-red-400/40 focus:border-red-400"
                        : "border-slate-200 focus:ring-orange-400/40 focus:border-orange-400"
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mismatch && (
                  <p className="text-[12px] font-satoshi text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Passwords don't match
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-satoshi text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                    : <><ArrowRight className="w-4 h-4" /> Update Password</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Default exports (keep existing router compatibility)
