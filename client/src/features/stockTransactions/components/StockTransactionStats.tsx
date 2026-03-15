import { PackagePlus, ShoppingCart, PackageMinus, ArrowRightLeft, TrendingDown } from "lucide-react";
import type { StockTransactionStats } from "../types/stockTransaction.types";

function StatPill({
  icon, label, value, iconBg, loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBg: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/6 shadow-sm">
        <div className="relative overflow-hidden h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/6 shrink-0">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="relative overflow-hidden h-5 w-8 rounded bg-slate-100 dark:bg-white/6">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
          <div className="relative overflow-hidden h-3 w-16 rounded bg-slate-100 dark:bg-white/6">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/6 shadow-sm">
      <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-black text-slate-800 dark:text-white leading-none">
          {value.toLocaleString()}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

interface StockTransactionStatsProps {
  stats: StockTransactionStats;
  loading: boolean;
}

export function StockTransactionStats({ stats, loading }: StockTransactionStatsProps) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatPill
        loading={loading}
        value={stats.purchaseCount}
        label="Purchases"
        iconBg="bg-emerald-50 dark:bg-emerald-500/10"
        icon={<PackagePlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      />
      <StatPill
        loading={loading}
        value={stats.consumptionCount}
        label="Consumption"
        iconBg="bg-blue-50 dark:bg-blue-500/10"
        icon={<ShoppingCart className="w-4 h-4 text-blue-500" />}
      />
      <StatPill
        loading={loading}
        value={stats.wastageCount}
        label="Wastage"
        iconBg="bg-red-50 dark:bg-red-500/10"
        icon={<TrendingDown className="w-4 h-4 text-red-500" />}
      />
      <StatPill
        loading={loading}
        value={stats.adjustmentCount}
        label="Adjustments"
        iconBg="bg-amber-50 dark:bg-amber-500/10"
        icon={<ArrowRightLeft className="w-4 h-4 text-amber-500" />}
      />
    </div>
  );
}
