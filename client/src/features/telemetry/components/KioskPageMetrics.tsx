import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { KioskTelemetryPages } from "../types/telemetry.types";

interface Props {
  data: KioskTelemetryPages | null;
  loading: boolean;
}

export function KioskPageMetrics({ data, loading }: Props) {
  const items = data?.items ?? [];
  const chartItems = items.slice(0, 6).map((item) => ({
    ...item,
    label: item.page || "unknown",
  }));

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
          Page Hotspots
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
          Views and exits across the kiosk flow
        </h3>
      </div>

      <div className="mt-5 h-[280px]">
        {loading ? (
          <div className="h-full animate-pulse rounded-3xl bg-slate-100 dark:bg-white/[0.04]" />
        ) : chartItems.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-white/[0.08] dark:text-slate-500">
            No page metrics available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartItems} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={34}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #dbeafe",
                }}
              />
              <Legend />
              <Bar dataKey="pageViews" name="Views" fill="#0284c7" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pageExits" name="Exits" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-200/80 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:border-white/[0.08] dark:text-slate-500">
              <th className="px-0 py-3 font-semibold">Page</th>
              <th className="px-3 py-3 font-semibold">Views</th>
              <th className="px-3 py-3 font-semibold">Exits</th>
              <th className="px-3 py-3 font-semibold">Total Events</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.page}
                className="border-b border-slate-100 text-sm text-slate-600 dark:border-white/[0.05] dark:text-slate-300"
              >
                <td className="px-0 py-3 font-medium text-slate-900 dark:text-white">
                  {item.page || "unknown"}
                </td>
                <td className="px-3 py-3">{item.pageViews}</td>
                <td className="px-3 py-3">{item.pageExits}</td>
                <td className="px-3 py-3">{item.totalEvents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
