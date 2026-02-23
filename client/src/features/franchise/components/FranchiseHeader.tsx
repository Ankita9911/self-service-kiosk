import { Plus, RefreshCcw, Building2 } from "lucide-react";
import { cn } from "@/shared/utils/commonFunction";

interface Props {
  refreshing: boolean;
  onRefresh: () => void;
  onNew: () => void;
}

export function FranchiseHeader({ refreshing, onRefresh, onNew }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-5 w-5 rounded bg-orange-100 flex items-center justify-center">
            <Building2 className="w-3 h-3 text-orange-600" />
          </div>
          <span className="text-[11px] font-clash-semibold text-orange-500 uppercase tracking-[0.15em]">
            Franchise Directory
          </span>
        </div>

        <h1 className="text-[28px] font-clash-bold text-slate-900 tracking-tight leading-none">
          Partners
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh"
          className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCcw
            className={cn("w-4 h-4", refreshing && "animate-spin")}
          />
        </button>

        <button
          onClick={onNew}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-clash-semibold transition-all shadow-lg shadow-slate-900/15"
        >
          <Plus className="w-4 h-4" />
          New Franchise
        </button>
      </div>
    </div>
  );
}