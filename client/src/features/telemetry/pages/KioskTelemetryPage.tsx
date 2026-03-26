import { Activity, AlertTriangle, MousePointerClick, TimerReset } from "lucide-react";
import { KioskTelemetryFilters } from "../components/KioskTelemetryFilters";
import { KioskFunnelChart } from "../components/KioskFunnelChart";
import { KioskPageMetrics } from "../components/KioskPageMetrics";
import { KioskComponentTable } from "../components/KioskComponentTable";
import { KioskDeviceTable } from "../components/KioskDeviceTable";
import { KioskSessionTable } from "../components/KioskSessionTable";
import { KioskSessionDrawer } from "../components/KioskSessionDrawer";
import { useKioskTelemetry } from "../hooks/useKioskTelemetry";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function formatWindow(from?: string, to?: string) {
  if (!from || !to) return "Last 7 days";

  const formatter = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(from))} - ${formatter.format(new Date(to))}`;
}

function formatStatusTime(value: string | null) {
  if (!value) return "No data";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: "emerald" | "sky" | "violet" | "rose";
}) {
  const toneClassMap = {
    emerald: "from-emerald-500/15 to-teal-500/5 text-emerald-700 dark:text-emerald-200",
    sky: "from-sky-500/15 to-cyan-500/5 text-sky-700 dark:text-sky-200",
    violet: "from-violet-500/15 to-fuchsia-500/5 text-violet-700 dark:text-violet-200",
    rose: "from-rose-500/15 to-orange-500/5 text-rose-700 dark:text-rose-200",
  };

  return (
    <article className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]">
      <div className={`rounded-[22px] bg-gradient-to-br p-4 ${toneClassMap[tone]}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
          {value}
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>
    </article>
  );
}

function ErrorTable({
  items,
  loading,
}: {
  items: Array<{
    page: string;
    component: string;
    errorCode: string;
    count: number;
  }>;
  loading: boolean;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-600 dark:text-rose-400">
          Error Hotspots
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
          Failure clusters by page and component
        </h3>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-200/80 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:border-white/[0.08] dark:text-slate-500">
              <th className="px-0 py-3 font-semibold">Page</th>
              <th className="px-3 py-3 font-semibold">Component</th>
              <th className="px-3 py-3 font-semibold">Error</th>
              <th className="px-3 py-3 font-semibold">Count</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 dark:border-white/[0.05]"
                >
                  <td className="px-0 py-3" colSpan={4}>
                    <div className="h-9 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.04]" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-0 py-8 text-center text-sm text-slate-400 dark:text-slate-500"
                >
                  No error telemetry found for this range
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={`${item.page}-${item.component}-${item.errorCode}`}
                  className="border-b border-slate-100 text-sm text-slate-600 dark:border-white/[0.05] dark:text-slate-300"
                >
                  <td className="px-0 py-3 font-medium text-slate-900 dark:text-white">
                    {item.page || "unknown"}
                  </td>
                  <td className="px-3 py-3">{item.component || "unknown"}</td>
                  <td className="px-3 py-3">{item.errorCode || "unknown"}</td>
                  <td className="px-3 py-3">{item.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function KioskTelemetryPage() {
  const {
    filters,
    setFilters,
    resetFilters,
    data,
    loading,
    refreshing,
    error,
    refetch,
    selectedSessionId,
    openSession,
    closeSession,
    sessionDetail,
    sessionEvents,
    sessionLoading,
    sessionError,
    loadMoreSessions,
    loadingMoreSessions,
  } = useKioskTelemetry();

  const summary = data?.overview.summary;
  const topDropOff = data?.overview.topDropOff;
  const status = data?.status;
  const freshnessTone =
    status?.freshness.state === "healthy"
      ? "text-emerald-700 bg-emerald-50 dark:text-emerald-200 dark:bg-emerald-500/10"
      : status?.freshness.state === "warning"
        ? "text-amber-700 bg-amber-50 dark:text-amber-200 dark:bg-amber-500/10"
        : status?.freshness.state === "disabled"
          ? "text-slate-700 bg-slate-100 dark:text-slate-200 dark:bg-white/[0.08]"
          : "text-rose-700 bg-rose-50 dark:text-rose-200 dark:bg-rose-500/10";

  return (
    <div className="space-y-6 pb-6">
      <section className="rounded-[32px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(241,245,249,0.92))] p-6 shadow-[0_28px_90px_-52px_rgba(15,23,42,0.4)] dark:border-white/[0.08] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(135deg,_rgba(13,17,23,0.95),_rgba(17,24,39,0.92))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
              Kiosk Telemetry
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Behavioral analytics for kiosk bottlenecks, friction, and drop-off
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              This dashboard reads from the dedicated telemetry pipeline, not the order analytics rollups.
              Use it to trace where customers stall, which controls absorb the most taps, and which devices drift below expected conversion.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/40 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Active Window
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                {formatWindow(data?.overview.window.from, data?.overview.window.to)}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/40 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Top Drop-off
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                {topDropOff ? `${topDropOff.step} (${topDropOff.count})` : "No drop-off signal"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <KioskTelemetryFilters
        filters={filters}
        onChange={setFilters}
        onRefresh={refetch}
        onReset={resetFilters}
        refreshing={refreshing}
      />

      {error && (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50/90 p-5 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold">Failed to load telemetry dashboard</h2>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sessions"
          value={String(summary?.sessions ?? 0)}
          description={`Across ${summary?.uniqueDevices ?? 0} active kiosk devices`}
          tone="emerald"
        />
        <StatCard
          label="Bounce Rate"
          value={formatPercent(summary?.bounceRate ?? 0)}
          description={`Checkout starts: ${formatPercent(summary?.checkoutStartRate ?? 0)}`}
          tone="sky"
        />
        <StatCard
          label="Completion Rate"
          value={formatPercent(summary?.completionRate ?? 0)}
          description={`Failures: ${formatPercent(summary?.failureRate ?? 0)}`}
          tone="violet"
        />
        <StatCard
          label="Avg Session Time"
          value={formatDuration(summary?.avgSessionDurationMs ?? 0)}
          description={`Cart creation: ${formatPercent(summary?.cartCreationRate ?? 0)}`}
          tone="rose"
        />
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Rollout Verification
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              Telemetry pipeline status for the current tenant scope
            </h3>
          </div>
          <div className={`rounded-2xl px-3 py-2 text-sm font-semibold ${freshnessTone}`}>
            {status?.freshness.message || "Checking telemetry freshness"}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Ingest
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {status?.ingestEnabled ? "Enabled" : "Disabled"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Read cache: {status?.readCacheEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Recent Volume
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {status?.eventCount ?? 0} events
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {status?.sessionCount ?? 0} sessions in the last {status?.windowHours ?? 24}h
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Latest Event
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {status?.latestEventName || "No event yet"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {formatStatusTime(status?.latestEventAt || null)}
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Raw Retention
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {status?.rawRetentionDays ?? 0} days
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest session: {formatStatusTime(status?.latestSessionStartedAt || null)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <KioskFunnelChart data={data?.funnel ?? null} loading={loading} />

        <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Fast Signals
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              Read the main operational pressures quickly
            </h3>
          </div>

          <div className="mt-5 space-y-3">
            {[
              {
                icon: Activity,
                label: "Unique devices",
                value: String(summary?.uniqueDevices ?? 0),
                note: "Distinct kiosks in the current time window",
              },
              {
                icon: MousePointerClick,
                label: "Component actions",
                value: String(data?.components.items.reduce((sum, item) => sum + item.count, 0) ?? 0),
                note: "Aggregated component-level interactions",
              },
              {
                icon: TimerReset,
                label: "Force logout rate",
                value: formatPercent(summary?.forceLogoutRate ?? 0),
                note: "Sessions interrupted by kiosk logout flow",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]"
              >
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.note}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <KioskPageMetrics data={data?.pages ?? null} loading={loading} />
        <ErrorTable items={data?.errors.items ?? []} loading={loading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <KioskComponentTable data={data?.components ?? null} loading={loading} />
        <KioskDeviceTable data={data?.devices ?? null} loading={loading} />
      </div>

      <KioskSessionTable
        data={data?.sessions ?? null}
        loading={loading}
        loadingMore={loadingMoreSessions}
        selectedSessionId={selectedSessionId}
        onSelect={openSession}
        onLoadMore={loadMoreSessions}
      />

      <KioskSessionDrawer
        open={Boolean(selectedSessionId)}
        onClose={closeSession}
        detail={sessionDetail}
        events={sessionEvents}
        loading={sessionLoading}
        error={sessionError}
      />
    </div>
  );
}
