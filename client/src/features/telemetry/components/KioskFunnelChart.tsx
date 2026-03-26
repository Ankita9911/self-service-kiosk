import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { KioskTelemetryFunnel } from "../types/telemetry.types";

interface Props {
  data: KioskTelemetryFunnel | null;
  loading: boolean;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function KioskFunnelChart({ data, loading }: Props) {
  const chartData =
    data?.funnel.map((row) => ({
      ...row,
      label: row.step.replaceAll("_", " "),
      conversion: Math.round(row.conversionFromPrevious * 100),
    })) ?? [];

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
            Funnel
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            Session progression through the kiosk journey
          </h3>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right dark:bg-emerald-500/10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
            Total Sessions
          </p>
          <p className="text-xl font-semibold text-emerald-700 dark:text-emerald-200">
            {data?.totalSessions ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-5 h-[320px]">
        {loading ? (
          <div className="h-full animate-pulse rounded-3xl bg-slate-100 dark:bg-white/[0.04]" />
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-white/[0.08] dark:text-slate-500">
            No funnel data for the current filter set
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 16, right: 12, left: 0, bottom: 12 }}>
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
                width={36}
              />
              <Tooltip
                cursor={{ fill: "rgba(16, 185, 129, 0.06)" }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #dbeafe",
                  boxShadow: "0 14px 40px -24px rgba(15,23,42,0.35)",
                }}
                formatter={(value: number | string | undefined) => [
                  value ?? 0,
                  "Sessions",
                ]}
              />
              <Bar
                dataKey="sessions"
                fill="#0f766e"
                radius={[10, 10, 0, 0]}
                maxBarSize={52}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {chartData.map((row) => (
          <div
            key={row.step}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3 dark:border-white/[0.06] dark:bg-white/[0.03]"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              {row.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {row.sessions}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conversion from previous: {formatPercent(row.conversionFromPrevious)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
