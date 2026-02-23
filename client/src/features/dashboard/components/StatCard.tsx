import { Shimmer } from "./Shimmer";

interface Props {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  accent?: "orange" | "emerald" | "blue";
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  subValue,
  icon,
  accent = "orange",
  loading = false,
}: Props) {
  const accentMap = {
    orange: {
      ring: "ring-orange-100",
      bg: "bg-orange-50",
      text: "text-orange-600",
      dot: "bg-orange-400",
    },
    emerald: {
      ring: "ring-emerald-100",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      dot: "bg-emerald-400",
    },
    blue: {
      ring: "ring-blue-100",
      bg: "bg-blue-50",
      text: "text-blue-600",
      dot: "bg-blue-400",
    },
  };

  const a = accentMap[accent];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-7 w-32" />
        <Shimmer className="h-3 w-20" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border p-6 ring-1 ${a.ring}`}>
      <div className="flex justify-between mb-4">
        <span className="text-xs uppercase text-slate-400">
          {label}
        </span>
        <div className={`h-9 w-9 rounded-xl ${a.bg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>

      <p className={`text-2xl font-bold ${a.text}`}>
        {value}
      </p>

      {subValue && (
        <p className="text-xs text-slate-400 mt-2">
          {subValue}
        </p>
      )}
    </div>
  );
}