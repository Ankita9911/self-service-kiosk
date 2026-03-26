import { X } from "lucide-react";
import type {
  KioskTelemetrySessionDetail,
  KioskTelemetrySessionEvents,
} from "../types/telemetry.types";

interface Props {
  open: boolean;
  onClose: () => void;
  detail: KioskTelemetrySessionDetail | null;
  events: KioskTelemetrySessionEvents | null;
  loading: boolean;
  error: string | null;
}

function formatDateTime(value: string | null) {
  if (!value) return "Active";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPayload(payload: Record<string, unknown> | null) {
  if (!payload || Object.keys(payload).length === 0) return "No payload";
  return JSON.stringify(payload);
}

export function KioskSessionDrawer({
  open,
  onClose,
  detail,
  events,
  loading,
  error,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-slate-950/45 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close session drawer"
        onClick={onClose}
        className="flex-1"
      />

      <aside className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0d1117]/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">
              Session Timeline
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              {detail?.visitorSessionId || "Loading session"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          {loading ? (
            <>
              <div className="h-28 animate-pulse rounded-[24px] bg-slate-100 dark:bg-white/[0.05]" />
              <div className="h-72 animate-pulse rounded-[24px] bg-slate-100 dark:bg-white/[0.05]" />
            </>
          ) : error ? (
            <div className="rounded-[24px] border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-5 text-sm text-rose-700 dark:text-rose-200">
              {error}
            </div>
          ) : (
            <>
              {detail && (
                <section className="rounded-[24px] border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
                        Device
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {detail.deviceId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
                        Status
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {detail.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
                        Started
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {formatDateTime(detail.startedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
                        Ended
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {formatDateTime(detail.endedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
                        Funnel
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {detail.funnelSteps.join(" → ") || "No funnel steps"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
                        Pages Visited
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {detail.pagesVisited.join(", ") || "No page views"}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <section className="rounded-[24px] border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
                      Events
                    </p>
                    <h4 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                      Ordered telemetry timeline
                    </h4>
                  </div>
                  <div className="rounded-2xl bg-slate-200/70 dark:bg-white/[0.05] px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                    {events?.items.length ?? 0} events
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {events?.items.length ? (
                    events.items.map((event) => (
                      <div
                        key={event.eventId}
                        className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-black/20 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {event.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {event.page || "unknown"} /{" "}
                              {event.component || "unknown"} /{" "}
                              {event.action || "unknown"}
                            </p>
                          </div>
                          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                            <p>#{event.seq}</p>
                            <p>{formatDateTime(event.eventAt)}</p>
                          </div>
                        </div>
                        <p className="mt-3 break-all rounded-xl bg-slate-100 dark:bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {formatPayload(event.payload)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-500">
                      No raw events available for this session
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
