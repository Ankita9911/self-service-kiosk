import { useState } from "react";
import {
  Mail,
  Loader2,
  ChefHat,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useLogin } from "../hooks/useLogin";
import { LoginBranding } from "../components/LoginBranding";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);

  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    fieldErrors,
    submit,
  } = useLogin();

  return (
    <div
      className="min-h-screen w-full flex overflow-hidden"
      style={{ fontFamily: "var(--font-body, 'Satoshi', sans-serif)" }}
    >
      <LoginBranding />

      <div className="flex-1 flex items-center justify-center bg-[#f7f8fa] px-6 py-12 relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-100 relative z-10">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-clash-bold text-slate-800 text-sm">
              serveX Admin Portal
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-[32px] font-clash-bold text-slate-900 leading-tight tracking-tight mb-1.5">
              Welcome back
            </h2>
            <p className="text-[14px] font-satoshi text-slate-500">
              Sign in to access your admin dashboard
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-7 space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-[13px] font-clash-semibold text-slate-700 uppercase tracking-wide"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                    focused === "email" ? "text-indigo-500" : "text-slate-400"
                  }`}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hyperkitchen.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className={`pl-10 h-11 font-satoshi text-sm rounded-xl focus-visible:ring-2 transition-all ${
                    fieldErrors.email
                      ? "border-red-400 bg-red-50 focus-visible:ring-red-400/40 focus-visible:border-red-400"
                      : "border-slate-200 bg-slate-50 focus-visible:ring-indigo-400/40 focus-visible:border-indigo-400"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[12px] font-satoshi text-red-500 flex items-center gap-1.5 mt-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-[13px] font-clash-semibold text-slate-700 uppercase tracking-wide"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className={`pl-10 pr-10 h-11 font-satoshi text-sm rounded-xl focus-visible:ring-2 transition-all ${
                    fieldErrors.password
                      ? "border-red-400 bg-red-50 focus-visible:ring-red-400/40 focus-visible:border-red-400"
                      : "border-slate-200 bg-slate-50 focus-visible:ring-indigo-400/40 focus-visible:border-indigo-400"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[12px] font-satoshi text-red-500 flex items-center gap-1.5 mt-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 animate-fade-in">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p className="text-[13px] font-satoshi text-red-600 leading-snug">
                  {error}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={loading || !email || !password}
              className={`
                w-full h-11 rounded-xl text-sm font-clash-semibold text-white
                flex items-center justify-center gap-2
                transition-all duration-200 active:scale-[0.98]
                ${
                  loading || !email || !password
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[12px] font-satoshi text-slate-400">
              Authorized access only · Activity is monitored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
