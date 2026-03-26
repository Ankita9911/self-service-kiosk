import { ChevronRight, LoaderCircle } from "lucide-react";
import type { KioskTelemetrySessions } from "../types/telemetry.types";

interface Props {
  data: KioskTelemetrySessions | null;
  loading: boolean;
  loadingMore: boolean;
  selectedSessionId: string | null;
  onSelect: (visitorSessionId: string) => void;
  onLoadMore: () => void;
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
  loadingMore,
  selectedSessionId,
  onSelect,
  onLoadMore,
}: Props) {
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-600 dark:text-rose-400">
            Session Drilldown
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            Inspect individual kiosk journeys and drop-offs
          </h3>
        </div>

        <div className="rounded-2xl bg-rose-50 px-3 py-2 text-right dark:bg-rose-500/10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">
            Matching Sessions
          </p>
          <p className="text-xl font-semibold text-rose-700 dark:text-rose-200">
            {pagination?.totalMatching ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-200/80 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:border-white/[0.08] dark:text-slate-500">
              <th className="px-0 py-3 font-semibold">Session</th>
              <th className="px-3 py-3 font-semibold">Device</th>
              <th className="px-3 py-3 font-semibold">Started</th>
              <th className="px-3 py-3 font-semibold">Outcome</th>
              <th className="px-3 py-3 font-semibold">Drop-off</th>
              <th className="px-3 py-3 font-semibold">Events</th>
              <th className="px-0 py-3 font-semibold text-right">Inspect</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
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
                  No matching sessions found
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSelected = selectedSessionId === item.visitorSessionId;

                return (
                  <tr
                    key={item.visitorSessionId}
                    className="border-b border-slate-100 text-sm text-slate-600 dark:border-white/[0.05] dark:text-slate-300"
                  >
                    <td className="px-0 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {item.visitorSessionId.slice(0, 8)}...
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {item.entryPage || "unknown"} → {item.exitPage || "active"}
                      </div>
                    </td>
                    <td className="px-3 py-3">{item.deviceId}</td>
                    <td className="px-3 py-3">{formatDateTime(item.startedAt)}</td>
                    <td className="px-3 py-3">{getOutcomeLabel(item)}</td>
                    <td className="px-3 py-3">{item.dropOffStep || "n/a"}</td>
                    <td className="px-3 py-3">{item.eventCount}</td>
                    <td className="px-0 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelect(item.visitorSessionId)}
                        className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[12px] font-semibold transition ${
                          isSelected
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-white/[0.08] dark:text-slate-300 dark:hover:border-white/[0.14] dark:hover:text-white"
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

      {pagination?.hasNext && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-[12px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.08] dark:text-slate-300 dark:hover:border-white/[0.14] dark:hover:text-white"
          >
            {loadingMore && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
            Load more sessions
          </button>
        </div>
      )}
    </section>
  );
}
