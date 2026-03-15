import { ChefHat, ShieldCheck, BarChart3, Utensils, Wifi } from "lucide-react";
import { FeaturePill } from "./FeaturePill";

export function LoginBranding() {
  return (
    <div className="hidden lg:flex w-[52%] relative bg-[#0f1117] flex-col justify-between p-12 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-indigo-600/20 via-indigo-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-125 h-125 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-100 h-100 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
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
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[11px] font-clash-medium text-indigo-400 uppercase tracking-widest">
            Admin Portal
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl xl:text-6xl font-clash-bold text-white leading-[1.05] tracking-tight">
            Central Kitchen
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-violet-400">
              Intelligence
            </span>
          </h1>
          <p className="text-slate-400 font-satoshi text-[15px] leading-relaxed max-w-sm">
            Manage franchises, oversee kiosk outlets, and monitor devices — all
            from one unified command center.
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
  );
}
