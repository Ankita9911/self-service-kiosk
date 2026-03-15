import { PackageCheck, RefreshCw, Wifi } from "lucide-react";

interface Props {
  readyCount: number;
  pendingCount: number;
  lastUpdated: Date;
  onRefresh: () => void;
}

export function PickupTopBar({
  readyCount,
  pendingCount,
  lastUpdated,
  onRefresh,
}: Props) {
  return (
    <div className="bg-white dark:bg-[#161920] border-b border-slate-100 dark:border-white/6 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
          <PackageCheck className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-800 dark:text-white leading-tight">
            Pickup Counter
          </h1>
          <div className="flex items-center gap-1 mt-0.5">
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Live
            </span>
          </div>
        </div>

        {readyCount > 0 && (
          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {readyCount} ready
          </span>
        )}

        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full">
            {pendingCount} preparing
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {lastUpdated.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <button
          onClick={onRefresh}
          className="h-8 w-8 rounded-xl border border-slate-100 dark:border-white/8 bg-white dark:bg-white/4 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
