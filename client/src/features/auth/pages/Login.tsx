import { useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  Loader2,
  ChefHat,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Utensils,
  BarChart3,
  Wifi,
} from "lucide-react";
import { useState } from "react";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useLogin } from "../hooks/useLogin";
import { FeaturePill } from "../components/FeaturePill";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);

  const { email, setEmail, password, setPassword, loading, error, submit } =
    useLogin();

  return (
    <div
      className="min-h-screen w-full flex overflow-hidden"
      style={{ fontFamily: "var(--font-body, 'Satoshi', sans-serif)" }}
    >
      <div className="hidden lg:flex w-[52%] relative bg-[#0f1117] flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-orange-500/5 to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-clash-bold leading-none">
              Hyper Kitchen
            </p>
            <p className="text-slate-500 text-[10px] font-satoshi tracking-widest uppercase mt-0.5">
              Management Suite
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-[11px] font-clash-medium text-orange-400 uppercase tracking-widest">
              Admin Portal
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl xl:text-6xl font-clash-bold text-white leading-[1.05] tracking-tight">
              Central Kitchen
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">
                Intelligence
              </span>
            </h1>
            <p className="text-slate-400 font-satoshi text-[15px] leading-relaxed max-w-sm">
              Manage franchises, oversee kiosk outlets, and monitor devices —
              all from one unified command center.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 text-white">
            <FeaturePill
              icon={ShieldCheck}
              text="Secure enterprise-grade access"
            />
            <FeaturePill
              icon={BarChart3}
              text="Real-time outlet performance tracking"
            />
            <FeaturePill icon={Utensils} text="Multi-franchise management" />
            <FeaturePill icon={Wifi} text="Live device monitoring" />
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-slate-600 text-xs font-satoshi">
            © {new Date().getFullYear()} Hyper Kitchen · Internal use only
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#f7f8fa] px-6 py-12 relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-clash-bold text-slate-800 text-sm">
              Hyper Kitchen
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
                    focused === "email" ? "text-orange-500" : "text-slate-400"
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
                  className="pl-10 h-11 font-satoshi text-sm border-slate-200 bg-slate-50 rounded-xl focus-visible:ring-2 focus-visible:ring-orange-400/40 focus-visible:border-orange-400 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-[13px] font-clash-semibold text-slate-700 uppercase tracking-wide"
              >
                Password
              </Label>
              <div className="relative">
                <LockKeyhole
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                    focused === "password"
                      ? "text-orange-500"
                      : "text-slate-400"
                  }`}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="pl-10 pr-10 h-11 font-satoshi text-sm border-slate-200 bg-slate-50 rounded-xl focus-visible:ring-2 focus-visible:ring-orange-400/40 focus-visible:border-orange-400 transition-all"
                  required
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
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 animate-fade-in">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
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
                    ? "bg-orange-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
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
