import { ChefHat, Sparkles, Clock } from "lucide-react";

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
      <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className={`text-xl font-black leading-none ${valueClassName ?? "text-slate-800 dark:text-white"}`}>
          {value}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

interface Props {
  loading: boolean;
  totalRecipes: number;
  aiGeneratedCount: number;
  avgPrepTime: number;
}

export function RecipeStats({ loading, totalRecipes, aiGeneratedCount, avgPrepTime }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatPill
        loading={loading}
        value={totalRecipes}
        label="Total Recipes"
        iconBg="bg-amber-50 dark:bg-amber-500/10"
        icon={<ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
      />
      <StatPill
        loading={loading}
        value={aiGeneratedCount}
        label="AI Generated"
        iconBg="bg-purple-50 dark:bg-purple-500/10"
        icon={<Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />}
        valueClassName={aiGeneratedCount > 0 ? "text-purple-600 dark:text-purple-400" : "text-slate-800 dark:text-white"}
      />
      <StatPill
        loading={loading}
        value={avgPrepTime > 0 ? `${avgPrepTime}m` : "—"}
        label="Avg Prep Time"
        iconBg="bg-sky-50 dark:bg-sky-500/10"
        icon={<Clock className="w-4 h-4 text-sky-500 dark:text-sky-400" />}
      />
    </div>
  );
}
