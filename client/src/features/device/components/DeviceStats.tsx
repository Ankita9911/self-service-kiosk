import type { Device } from "../types/device.types";

export function DeviceStats({
  devices,
  loading,
}: {
  devices: Device[];
  loading: boolean;
}) {
  const activeCount = devices.filter(d => d.status === "ACTIVE").length;

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[80, 72, 72].map((w, i) => (
          <div key={i} className="relative overflow-hidden bg-slate-100 rounded-lg h-8" style={{ width: w }}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Total", value: devices.length, cls: "bg-slate-100 text-slate-700 border-slate-200" },
    { label: "Online", value: activeCount, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { label: "Offline", value: devices.length - activeCount, cls: "bg-red-50 text-red-600 border-red-200" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {stats.map(s => (
        <div key={s.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-clash-semibold border ${s.cls}`}>
          {s.value}
          <span className="font-satoshi font-normal text-xs opacity-70">{s.label}</span>
        </div>
      ))}
    </div>
  );
}