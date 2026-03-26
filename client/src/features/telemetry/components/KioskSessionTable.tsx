import { ChevronRight } from "lucide-react";
import { CursorPagination } from "@/shared/components/ui/CursorPagination";
import type { KioskTelemetrySessions } from "../types/telemetry.types";

interface Props {
  data: KioskTelemetrySessions | null;
  loading: boolean;
  page: number;
  pageSize: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  selectedSessionId: string | null;
  onSelect: (visitorSessionId: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (size: number) => void;
}

function formatDateTime(value: string | null) {
  if (!value) return "Active";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getOutcomeLabel(item: KioskTelemetrySessions["items"][number]) {
  if (item.orderCompleted) return "Completed";
  if (item.orderFailed) return "Failed";
  if (item.forceLoggedOut) return "Force logout";
  return item.status;
}

export function KioskSessionTable({
  data,
  loading,
  page,
  pageSize,
  hasPrevPage,
  hasNextPage,
  selectedSessionId,
  onSelect,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
}: Props) {
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-600 dark:text-rose-400">
            Session Drilldown
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            Inspect individual kiosk journeys and drop-offs
          </h3>
        </div>

        <div className="inline-flex items-center gap-3 rounded-2xl bg-rose-50 px-4 py-2 dark:bg-rose-500/10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap text-rose-600 dark:text-rose-300">
            Matching Sessions
          </p>
          <p className="text-2xl leading-none font-semibold tabular-nums text-rose-700 dark:text-rose-200">
            {pagination?.totalMatching ?? 0}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Drop-off
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Events
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Inspect
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/4">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr
                    key={index}
                    className="hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
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
                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="font-medium text-slate-600 dark:text-slate-300">
                        No sessions found
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm">
                        Try adjusting your filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isSelected =
                    selectedSessionId === item.visitorSessionId;

                  return (
                    <tr
                      key={item.visitorSessionId}
                      className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                          {item.visitorSessionId.slice(0, 8)}...
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {item.entryPage || "unknown"} →{" "}
                          {item.exitPage || "active"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {item.deviceId}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {formatDateTime(item.startedAt)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {getOutcomeLabel(item)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {item.dropOffStep || "n/a"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {item.eventCount}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelect(item.visitorSessionId)}
                          className={`inline-flex h-8 items-center gap-2 rounded-lg px-3 text-[12px] font-semibold transition ${
                            isSelected
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                              : "border border-slate-200 dark:border-white/8 bg-white dark:bg-white/4 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400"
                          }`}
                        >
                          Inspect
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && (pagination?.totalMatching ?? 0) > 0 && (
          <CursorPagination
            total={pagination?.totalMatching ?? 0}
            page={page}
            pageSize={pageSize}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
    </section>
  );
}
