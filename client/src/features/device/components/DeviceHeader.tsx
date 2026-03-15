import { MonitorSmartphone, Plus, RefreshCcw } from "lucide-react";

interface Props {
  refreshing: boolean;
  canCreate: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}

export function DeviceHeader({
  refreshing,
  canCreate,
  onRefresh,
  onCreate,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
      <div>
        <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
          Devices
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monitor and register kiosk hardware across outlets.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-all disabled:opacity-50"
        >
          <RefreshCcw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>

        {canCreate && (
          <button
            onClick={onCreate}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Register Device
          </button>
        )}
      </div>
    </div>
  );
}
