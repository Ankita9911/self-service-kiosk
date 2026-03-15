import { Package, AlertTriangle, TrendingUp } from "lucide-react";

function StatPill({
  icon,
  label,
  value,
  iconBg,
  loading,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  iconBg: string;
  loading: boolean;
  valueClassName?: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/[0.07] shadow-sm">
        <div className="relative overflow-hidden h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] shrink-0">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="relative overflow-hidden h-5 w-8 rounded bg-slate-100 dark:bg-white/[0.06]">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
          <div className="relative overflow-hidden h-3 w-14 rounded bg-slate-100 dark:bg-white/[0.06]">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/[0.07] shadow-sm">
      <div
        className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p
          className={`text-xl font-black leading-none ${valueClassName ?? "text-slate-800 dark:text-white"}`}
        >
          {value}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
          {label}
        </p>
      </div>
    </div>
  );
}

interface Props {
  loading: boolean;
  totalItems: number;
  lowStockItems: number;
}

export function IngredientStats({ loading, totalItems, lowStockItems }: Props) {
  const inStock = Math.max(0, totalItems - lowStockItems);

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatPill
        loading={loading}
        value={totalItems}
        label="Total Ingredients"
        iconBg="bg-indigo-50 dark:bg-indigo-500/10"
        icon={<Package className="w-4 h-4 text-indigo-500" />}
      />
      <StatPill
        loading={loading}
        value={inStock}
        label="In Stock"
        iconBg="bg-emerald-50 dark:bg-emerald-500/10"
        icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
      />
      <StatPill
        loading={loading}
        value={lowStockItems}
        label="Low Stock"
        iconBg="bg-red-50 dark:bg-red-500/10"
        icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
        valueClassName={
          lowStockItems > 0
            ? "text-red-600 dark:text-red-400"
            : "text-slate-800 dark:text-white"
        }
      />
    </div>
  );
}
