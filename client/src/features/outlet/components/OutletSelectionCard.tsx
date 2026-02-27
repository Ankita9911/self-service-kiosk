import { Store, ArrowRight, MapPin, Circle } from "lucide-react";
import type { Outlet } from "@/features/outlet/types/outlet.types";

interface Props {
  outlet: Outlet;
  onClick: () => void;
}

export function OutletSelectionCard({ outlet, onClick }: Props) {
  const isActive = outlet.status?.toLowerCase() === "active";

  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#1e2130] hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/5 transition-all text-left w-full"
    >
      <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
        <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-slate-800 dark:text-white text-sm leading-snug">
            {outlet.name}
          </p>
          <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5" />
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
          {outlet.outletCode}
        </p>

        {outlet.address && (
          <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {outlet.address}
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-2">
          <Circle
            className={`w-2 h-2 ${
              isActive ? "fill-emerald-500 text-emerald-500" : "fill-slate-400 text-slate-400"
            }`}
          />
          <span className={`text-[11px] font-semibold ${
            isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
          }`}>
            {outlet.status ?? "Active"}
          </span>
        </div>
      </div>
    </button>
  );
}