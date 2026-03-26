import { useState } from "react";
import { Cpu } from "lucide-react";
import { TablePagination } from "@/shared/components/ui/TablePagination";
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = items.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return (
    <section className="space-y-4">
      <div className="px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">
          Device Comparison
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
          Compare device quality and conversion performance
        </h3>
      </div>

      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Checkout Starts
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Failed
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Avg Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/4">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={index}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
                  >
                    <td className="px-5 py-4" colSpan={7}>
                      <div className="h-9 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/6" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="font-medium text-slate-600 dark:text-slate-300">
                        No device telemetry available
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.deviceId}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white text-sm">
                      {item.deviceId}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {item.sessionCount}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {item.checkoutStartedSessions}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {item.completedSessions}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {item.failedSessions}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatPercent(item.completionRate)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatDuration(item.avgSessionDurationMs)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && total > 0 && (
          <TablePagination
            total={total}
            page={safePage}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </div>
    </section>
  );
}
