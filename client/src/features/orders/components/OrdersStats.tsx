import { ShoppingCart, TrendingUp, IndianRupee, Clock } from "lucide-react";
import type { OrderStats } from "../types/order.types";

function StatPill({
  icon,
  label,
  value,
  iconBg,
  loading,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
  loading: boolean;
  sub?: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/7 shadow-sm">
        <div className="relative overflow-hidden h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/6 shrink-0">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="relative overflow-hidden h-5 w-20 rounded bg-slate-100 dark:bg-white/6">
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
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/7 shadow-sm">
      <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{value}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{label}</p>
        {sub && <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

interface OrdersStatsProps {
  stats: OrderStats | null;
  loading: boolean;
}

function formatCurrency(v: number): string {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toFixed(0)}`;
}

function formatHour(h: number | null): string {
  if (h === null) return "—";
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${period}`;
}

export function OrdersStats({ stats, loading }: OrdersStatsProps) {
  const totalOrders = stats?.summary.totalOrders ?? 0;
  const totalRevenue = stats?.summary.totalRevenue ?? 0;
  const avgOrderValue = stats?.summary.avgOrderValue ?? 0;
  const peakHour = stats?.summary.peakHour ?? null;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatPill
        loading={loading}
        value={totalOrders.toLocaleString()}
        label="Total Orders"
        iconBg="bg-indigo-50 dark:bg-indigo-500/10"
        icon={<ShoppingCart className="w-4 h-4 text-indigo-500" />}
      />
      <StatPill
        loading={loading}
        value={formatCurrency(totalRevenue)}
        label="Total Revenue"
        iconBg="bg-emerald-50 dark:bg-emerald-500/10"
        icon={<IndianRupee className="w-4 h-4 text-emerald-500" />}
      />
      <StatPill
        loading={loading}
        value={formatCurrency(avgOrderValue)}
        label="Avg Order Value"
        iconBg="bg-amber-50 dark:bg-amber-500/10"
        icon={<TrendingUp className="w-4 h-4 text-amber-500" />}
      />
      <StatPill
        loading={loading}
        value={formatHour(peakHour)}
        label="Peak Hour"
        iconBg="bg-violet-50 dark:bg-violet-500/10"
        icon={<Clock className="w-4 h-4 text-violet-500" />}
        sub={peakHour !== null ? "busiest hour of the day" : undefined}
      />
    </div>
  );
}
