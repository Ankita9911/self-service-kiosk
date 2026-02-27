import { ChefHat, RefreshCcw, Wifi } from "lucide-react";

interface Props {
  totalActive: number;
  lastUpdated: Date;
  onRefresh: () => void;
}

export function KitchenTopBar({ totalActive, lastUpdated, onRefresh }: Props) {
  return (
    <div className="bg-white dark:bg-[#161920] border-b border-slate-100 dark:border-white/[0.06] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
          <ChefHat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Kitchen Display</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Wifi className="w-2.5 h-2.5 text-emerald-500" />
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
          </div>
        </div>
        {totalActive > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">{totalActive} active</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        <button
          onClick={onRefresh}
          className="h-8 w-8 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-all"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}