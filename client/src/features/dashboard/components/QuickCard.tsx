import { ChevronRight } from "lucide-react";
import { Shimmer } from "./Shimmer";

interface Props {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  onClick: () => void;
  loading: boolean;
}

export function QuickCard({
  title,
  description,
  icon,
  badge,
  onClick,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl  p-7 space-y-4">
        <Shimmer className="h-12 w-12 rounded-xl" />
        <Shimmer className="h-5 w-32" />
        <Shimmer className="h-3 w-full" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group w-full bg-white rounded-2xl border p-7 text-left hover:border-orange-300 transition-all"
    >
      <div className="flex justify-between mb-4">
        <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center">
          {icon}
        </div>

        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-all" />
        </div>
      </div>

      <h3 className="font-semibold text-slate-800">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        {description}
      </p>
    </button>
  );
}