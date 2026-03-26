import { BarChart3 } from "lucide-react";
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
            <BarChart
              data={chartItems}
              margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
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
              <Bar
                dataKey="pageViews"
                name="Views"
                fill="#0284c7"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="pageExits"
                name="Exits"
                fill="#f97316"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Exits
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Total Events
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/4">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="font-medium text-slate-600 dark:text-slate-300">
                        No page metrics available
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.page}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white text-sm">
                      {item.page || "unknown"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {item.pageViews}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {item.pageExits}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {item.totalEvents}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
