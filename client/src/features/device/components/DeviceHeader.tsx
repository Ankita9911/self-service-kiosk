import { Activity, Plus, RefreshCcw } from "lucide-react";
import { cn } from "@/shared/lib/utils";

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
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-[11px] font-clash-semibold text-orange-500 uppercase tracking-widest">
            Kiosks
          </span>
        </div>

        <h1 className="text-[28px] font-clash-bold text-slate-900 tracking-tight">
          Device Management
        </h1>

        <p className="text-sm font-satoshi text-slate-500 mt-0.5">
          Monitor and register kiosk hardware across outlets.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-50"
        >
          <RefreshCcw
            className={cn("w-4 h-4", refreshing && "animate-spin")}
          />
        </button>

        {canCreate && (
          <button
            onClick={onCreate}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Register Device
          </button>
        )}
      </div>
    </div>
  );
}