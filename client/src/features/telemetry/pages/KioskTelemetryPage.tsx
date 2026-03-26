import {
  Activity,
  AlertTriangle,
  MousePointerClick,
  TimerReset,
} from "lucide-react";
import { useEffect, useState } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import { getDevices } from "@/features/device/services/device.service";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import type { Device } from "@/features/device/types/device.types";
import { KioskTelemetryFilters } from "../components/KioskTelemetryFilters";
import { KioskFunnelChart } from "../components/KioskFunnelChart";
import { KioskPageMetrics } from "../components/KioskPageMetrics";
import { KioskComponentTable } from "../components/KioskComponentTable";
import { KioskDeviceTable } from "../components/KioskDeviceTable";
import { KioskSessionTable } from "../components/KioskSessionTable";
import { KioskSessionDrawer } from "../components/KioskSessionDrawer";
import { useKioskTelemetry } from "../hooks/useKioskTelemetry";
import { TablePagination } from "@/shared/components/ui/TablePagination";
import { Shimmer } from "@/shared/components/ui/ShimmerCell";

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
    emerald:
      "from-emerald-500/15 to-teal-500/5 text-emerald-700 dark:text-emerald-200",
    sky: "from-sky-500/15 to-cyan-500/5 text-sky-700 dark:text-sky-200",
    violet:
      "from-violet-500/15 to-fuchsia-500/5 text-violet-700 dark:text-violet-200",
    rose: "from-rose-500/15 to-orange-500/5 text-rose-700 dark:text-rose-200",
  };

  return (
    <article className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]">
      <div
        className={`rounded-[22px] bg-gradient-to-br p-4 ${toneClassMap[tone]}`}
      >
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-600 dark:text-rose-400">
          Error Hotspots
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
          Failure clusters by page and component
        </h3>
      </div>

      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
              <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                Page
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                Component
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                Error
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                Count
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr
                  key={index}
                  className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
                >
                  <td className="px-5 py-4" colSpan={4}>
                    <div className="h-9 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/6" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="font-medium text-slate-600 dark:text-slate-300">
                      No error telemetry found
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                      Try adjusting your filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr
                  key={`${item.page}-${item.component}-${item.errorCode}`}
                  className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white text-sm">
                    {item.page || "unknown"}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {item.component || "unknown"}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {item.errorCode || "unknown"}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {item.count}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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

export default function KioskTelemetryPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isFranchiseAdmin = user?.role === "FRANCHISE_ADMIN";
  const hasOutletId = !!user?.outletId;

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [inlineShimmerVisible, setInlineShimmerVisible] = useState(true);
  const [activeTable, setActiveTable] = useState<
    "pages" | "errors" | "components" | "devices" | "sessions"
  >("pages");

  const {
    filters,
    setFilters,
    resetFilters,
    data,
    sessions,
    loading,
    sessionsLoading,
    refreshing,
    error,
    refetch,
    sessionPage,
    sessionPageSize,
    sessionHasPrevPage,
    sessionHasNextPage,
    goToNextSessionPage,
    goToPrevSessionPage,
    setSessionPageSize,
    selectedSessionId,
    openSession,
    closeSession,
    sessionDetail,
    sessionEvents,
    sessionLoading,
    sessionError,
  } = useKioskTelemetry();

  useEffect(() => {
    if (isSuperAdmin) {
      getOutlets()
        .then(setOutlets)
        .catch(() => {});
      getDevices()
        .then(setDevices)
        .catch(() => {});
    } else if (isFranchiseAdmin) {
      getOutlets({ franchiseId: user?.franchiseId ?? "" })
        .then(setOutlets)
        .catch(() => {});
      getDevices({ franchiseId: user?.franchiseId ?? "" })
        .then(setDevices)
        .catch(() => {});
    } else if (hasOutletId) {
      getDevices({ outletId: user?.outletId ?? "" })
        .then(setDevices)
        .catch(() => {});
    }
  }, [
    isSuperAdmin,
    isFranchiseAdmin,
    hasOutletId,
    user?.franchiseId,
    user?.outletId,
  ]);

  useEffect(() => {
    if (loading || refreshing) {
      setInlineShimmerVisible(true);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setInlineShimmerVisible(false);
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [loading, refreshing]);

  const summary = data?.overview.summary;
  const status = data?.status;
  const showShimmer = inlineShimmerVisible;
  const tableLoading = showShimmer;
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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
            Kiosk Telemetry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Behavioral analytics for kiosk bottlenecks, friction, and drop-off
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 text-[13px] font-medium whitespace-nowrap">
          <span>Window:</span>
          <span className="text-slate-800 dark:text-slate-200">
            {formatWindow(data?.overview.window.from, data?.overview.window.to)}
          </span>
        </div>
      </div>

      <KioskTelemetryFilters
        filters={filters}
        onChange={setFilters}
        onRefresh={refetch}
        onReset={resetFilters}
        refreshing={refreshing}
        outlets={outlets}
        devices={devices}
        isSuperAdmin={isSuperAdmin}
        isFranchiseAdmin={isFranchiseAdmin}
        hasOutletId={hasOutletId}
      />

      {error && (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50/90 p-5 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold">
                Failed to load telemetry dashboard
              </h2>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {showShimmer ? (
          Array.from({ length: 4 }).map((_, index) => (
            <article
              key={index}
              className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]"
            >
              <div className="rounded-[22px] p-4 bg-slate-50/80 dark:bg-white/[0.03]">
                <Shimmer w="w-20" h="h-3" />
                <Shimmer w="w-28" h="h-8" className="mt-3" />
                <Shimmer w="w-44" h="h-4" className="mt-2" />
              </div>
            </article>
          ))
        ) : (
          <>
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
          </>
        )}
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
          {showShimmer ? (
            <div className="rounded-2xl px-3 py-2">
              <Shimmer w="w-52" h="h-5" />
            </div>
          ) : (
            <div
              className={`rounded-2xl px-3 py-2 text-sm font-semibold ${freshnessTone}`}
            >
              {status?.freshness.message || "Checking telemetry freshness"}
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Ingest
            </p>
            {showShimmer ? (
              <>
                <Shimmer w="w-24" h="h-6" className="mt-2" />
                <Shimmer w="w-32" h="h-4" className="mt-2" />
              </>
            ) : (
              <>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {status?.ingestEnabled ? "Enabled" : "Disabled"}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Read cache:{" "}
                  {status?.readCacheEnabled ? "Enabled" : "Disabled"}
                </p>
              </>
            )}
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Recent Volume
            </p>
            {showShimmer ? (
              <>
                <Shimmer w="w-20" h="h-6" className="mt-2" />
                <Shimmer w="w-40" h="h-4" className="mt-2" />
              </>
            ) : (
              <>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {status?.eventCount ?? 0} events
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {status?.sessionCount ?? 0} sessions in the last{" "}
                  {status?.windowHours ?? 24}h
                </p>
              </>
            )}
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Latest Event
            </p>
            {showShimmer ? (
              <>
                <Shimmer w="w-28" h="h-6" className="mt-2" />
                <Shimmer w="w-36" h="h-4" className="mt-2" />
              </>
            ) : (
              <>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {status?.latestEventName || "No event yet"}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {formatStatusTime(status?.latestEventAt || null)}
                </p>
              </>
            )}
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Raw Retention
            </p>
            {showShimmer ? (
              <>
                <Shimmer w="w-16" h="h-6" className="mt-2" />
                <Shimmer w="w-40" h="h-4" className="mt-2" />
              </>
            ) : (
              <>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {status?.rawRetentionDays ?? 0} days
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Latest session:{" "}
                  {formatStatusTime(status?.latestSessionStartedAt || null)}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="space-y-6">
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

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                value: String(
                  data?.components.items.reduce(
                    (sum, item) => sum + item.count,
                    0,
                  ) ?? 0,
                ),
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
                    {showShimmer ? (
                      <>
                        <Shimmer w="w-20" h="h-7" className="mt-1" />
                        <Shimmer w="w-44" h="h-4" className="mt-2" />
                      </>
                    ) : (
                      <>
                        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                          {item.value}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {item.note}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 rounded-xl p-1 w-fit">
          {[
            { id: "pages", label: "Page Hotspots" },
            { id: "errors", label: "Error Hotspots" },
            { id: "components", label: "Component Actions" },
            { id: "devices", label: "Device Comparison" },
            { id: "sessions", label: "Session Drilldown" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTable(
                  tab.id as
                    | "pages"
                    | "errors"
                    | "components"
                    | "devices"
                    | "sessions",
                )
              }
              className={`px-3 h-8 rounded-lg text-[12px] font-semibold transition-all ${
                activeTable === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTable === "pages" && (
          <KioskPageMetrics data={data?.pages ?? null} loading={tableLoading} />
        )}

        {activeTable === "errors" && (
          <ErrorTable items={data?.errors.items ?? []} loading={tableLoading} />
        )}

        {activeTable === "components" && (
          <KioskComponentTable
            data={data?.components ?? null}
            loading={tableLoading}
          />
        )}

        {activeTable === "devices" && (
          <KioskDeviceTable
            data={data?.devices ?? null}
            loading={tableLoading}
          />
        )}

        {activeTable === "sessions" && (
          <KioskSessionTable
            data={sessions}
            loading={sessionsLoading || tableLoading}
            page={sessionPage}
            pageSize={sessionPageSize}
            hasPrevPage={sessionHasPrevPage}
            hasNextPage={sessionHasNextPage}
            selectedSessionId={selectedSessionId}
            onSelect={openSession}
            onPrevPage={goToPrevSessionPage}
            onNextPage={goToNextSessionPage}
            onPageSizeChange={setSessionPageSize}
          />
        )}
      </div>

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
