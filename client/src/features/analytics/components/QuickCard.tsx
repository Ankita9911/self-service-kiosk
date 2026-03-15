import { ArrowRight } from "lucide-react";
import { AnalyticsShimmer } from "./AnalyticsShared";

interface QuickCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  loading: boolean;
  onClick: () => void;
}

export function QuickCard({
  title,
  description,
  icon,
  badge,
  loading,
  onClick,
}: QuickCardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AnalyticsShimmer className="h-10 w-10 rounded-xl" />
          <AnalyticsShimmer className="h-5 w-36" />
        </div>
        <AnalyticsShimmer className="h-3.5 w-full" />
        <AnalyticsShimmer className="h-3.5 w-3/4" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/6 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-sm hover:shadow-indigo-50 dark:hover:shadow-indigo-900/10 rounded-2xl p-6 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="text-[13.5px] font-semibold text-slate-800 dark:text-white leading-none">
              {title}
            </h3>
            {badge && (
              <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors shrink-0">
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        </div>
      </div>
      <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </button>
  );
}
