import { Building2, CheckCircle2, XCircle } from "lucide-react";
import type { Franchise } from "../types/franchise.types";

interface Props {
  franchises: Franchise[];
  loading: boolean;
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
      <div className="relative overflow-hidden bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3 min-w-[120px]">
        <div className="relative overflow-hidden h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/[0.06] shrink-0">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="relative overflow-hidden h-4 w-8 rounded bg-slate-100 dark:bg-white/[0.06]">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
          <div className="relative overflow-hidden h-3 w-12 rounded bg-slate-100 dark:bg-white/[0.06]">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3">
      <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[15px] font-bold text-slate-800 dark:text-white leading-none">{value}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function FranchiseStats({ franchises, loading }: Props) {
  const activeCount   = franchises.filter(f => f.status === "ACTIVE").length;
  const inactiveCount = franchises.length - activeCount;

  return (
    <div className="flex flex-wrap gap-3">
      <StatPill loading={loading} value={franchises.length} label="Total" iconBg="bg-slate-50 dark:bg-white/[0.05]"    icon={<Building2    className="w-3.5 h-3.5 text-slate-400"   />} />
      <StatPill loading={loading} value={activeCount}       label="Active" iconBg="bg-emerald-50 dark:bg-emerald-500/10" icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />} />
      <StatPill loading={loading} value={inactiveCount}     label="Inactive" iconBg="bg-slate-50 dark:bg-white/[0.05]"  icon={<XCircle      className="w-3.5 h-3.5 text-slate-400"   />} />
    </div>
  );
}