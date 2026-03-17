import { RefreshCcw, ShoppingCart } from "lucide-react";

interface OrdersHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export function OrdersHeader({ refreshing, onRefresh }: OrdersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
          Orders
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete order history, analytics, and item-level breakdowns.
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="h-9 w-9 rounded-xl bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all disabled:opacity-50"
      >
        <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
