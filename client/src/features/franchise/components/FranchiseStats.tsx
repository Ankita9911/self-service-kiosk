import { Building2, CheckCircle2, XCircle } from "lucide-react";
import type { Franchise } from "../types/franchise.types";

interface Props {
  franchises: Franchise[];
  loading: boolean;
  totalFranchises?: number;
  activeFranchises?: number;
}

function StatPill({
  icon,
  label,
  value,
  iconBg,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBg: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/7 shadow-sm">
        <div className="relative overflow-hidden h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/6 shrink-0">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="relative overflow-hidden h-5 w-8 rounded bg-slate-100 dark:bg-white/6">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
          <div className="relative overflow-hidden h-3 w-14 rounded bg-slate-100 dark:bg-white/6">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/7 shadow-sm">
      <div
        className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xl font-black text-slate-800 dark:text-white leading-none">
          {value}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
          {label}
        </p>
      </div>
    </div>
  );
}

export function FranchiseStats({
  franchises,
  loading,
  totalFranchises,
  activeFranchises,
}: Props) {
  const totalCount =
    typeof totalFranchises === "number" ? totalFranchises : franchises.length;
  const activeCount =
    typeof activeFranchises === "number"
      ? activeFranchises
      : franchises.filter((f) => f.status === "ACTIVE").length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatPill
        loading={loading}
        value={totalCount}
        label="Total Franchises"
        iconBg="bg-indigo-50 dark:bg-indigo-500/10"
        icon={<Building2 className="w-4 h-4 text-indigo-500" />}
      />
      <StatPill
        loading={loading}
        value={activeCount}
        label="Active"
        iconBg="bg-emerald-50 dark:bg-emerald-500/10"
        icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
      />
      <StatPill
        loading={loading}
        value={inactiveCount}
        label="Inactive"
        iconBg="bg-slate-50 dark:bg-white/[0.05]"
        icon={<XCircle className="w-4 h-4 text-slate-400" />}
      />
    </div>
  );
}
