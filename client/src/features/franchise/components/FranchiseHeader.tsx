import { Plus, RefreshCcw, Building2 } from "lucide-react";

interface Props {
  refreshing: boolean;
  onRefresh: () => void;
  onNew: () => void;
}

export function FranchiseHeader({ refreshing, onRefresh, onNew }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
          Franchises
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monitor and manage franchises across your organization.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh"
          className="
            h-9 w-9 rounded-xl
            bg-white dark:bg-[#161920]
            border border-slate-100 dark:border-white/[0.08]
            flex items-center justify-center
            text-slate-400 dark:text-slate-500
            hover:text-indigo-500 dark:hover:text-indigo-400
            hover:border-indigo-200 dark:hover:border-indigo-500/30
            transition-all disabled:opacity-50
          "
        >
          <RefreshCcw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>

        <button
          onClick={onNew}
          className="
            flex items-center gap-2 h-9 px-4 rounded-xl
            bg-indigo-600 hover:bg-indigo-700
            text-white text-[13px] font-semibold
            shadow-lg shadow-indigo-500/20
            transition-all
          "
        >
          <Plus className="w-3.5 h-3.5" />
          New Franchise
        </button>
      </div>
    </div>
  );
}
