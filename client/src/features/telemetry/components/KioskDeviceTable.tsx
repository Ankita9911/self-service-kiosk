import type { KioskTelemetryDevices } from "../types/telemetry.types";

interface Props {
  data: KioskTelemetryDevices | null;
  loading: boolean;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export function KioskDeviceTable({ data, loading }: Props) {
  const items = data?.items ?? [];

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">
          Device Comparison
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
          Compare device quality and conversion performance
        </h3>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-200/80 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:border-white/[0.08] dark:text-slate-500">
              <th className="px-0 py-3 font-semibold">Device</th>
              <th className="px-3 py-3 font-semibold">Sessions</th>
              <th className="px-3 py-3 font-semibold">Checkout Starts</th>
              <th className="px-3 py-3 font-semibold">Completed</th>
              <th className="px-3 py-3 font-semibold">Failed</th>
              <th className="px-3 py-3 font-semibold">Completion Rate</th>
              <th className="px-3 py-3 font-semibold">Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 dark:border-white/[0.05]"
                >
                  <td className="px-0 py-3" colSpan={7}>
                    <div className="h-9 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.04]" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-0 py-8 text-center text-sm text-slate-400 dark:text-slate-500"
                >
                  No device telemetry available
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.deviceId}
                  className="border-b border-slate-100 text-sm text-slate-600 dark:border-white/[0.05] dark:text-slate-300"
                >
                  <td className="px-0 py-3 font-medium text-slate-900 dark:text-white">
                    {item.deviceId}
                  </td>
                  <td className="px-3 py-3">{item.sessionCount}</td>
                  <td className="px-3 py-3">{item.checkoutStartedSessions}</td>
                  <td className="px-3 py-3">{item.completedSessions}</td>
                  <td className="px-3 py-3">{item.failedSessions}</td>
                  <td className="px-3 py-3">{formatPercent(item.completionRate)}</td>
                  <td className="px-3 py-3">{formatDuration(item.avgSessionDurationMs)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
