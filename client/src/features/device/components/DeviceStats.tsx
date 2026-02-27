import type { Device } from "../types/device.types";

function StatPill({
  label,
  value,
  loading,
  color = "slate",
}: {
  label: string;
  value: number;
  loading: boolean;
  color?: "slate" | "emerald" | "red";
}) {
  const colorMap = {
    slate: "bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    red: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
  };

  if (loading) {
    return (
      <div className="h-8 w-20 rounded-lg bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-white/[0.04] dark:via-white/10 dark:to-white/[0.04] animate-shimmer bg-[length:400%_100%]" />
    );
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${colorMap[color]}`}>
      <span className="tabular-nums font-semibold">{value}</span>
      <span className="text-xs opacity-70 font-normal">{label}</span>
    </div>
  );
}

export function DeviceStats({
  devices,
  loading,
}: {
  devices: Device[];
  loading: boolean;
}) {
  const activeCount = devices.filter(d => d.status === "ACTIVE").length;

  return (
    <div className="flex flex-wrap gap-2">
      <StatPill label="Total" value={devices.length} loading={loading} color="slate" />
      <StatPill label="Online" value={activeCount} loading={loading} color="emerald" />
      <StatPill label="Offline" value={devices.length - activeCount} loading={loading} color="red" />
    </div>
  );
}