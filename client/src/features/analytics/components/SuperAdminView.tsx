import { Fragment } from "react";
import { Building2, Store, MonitorSmartphone, Users, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState, AnalyticsShimmer, PeriodSelector } from "./AnalyticsShared";
import { MonthlyCountChart, CountBarChart, DonutChart } from "./AnalyticsCharts";
import type { SuperAdminAnalytics } from "../types/analytics.types";

const SA_PERIODS = [
  { value: "3m",  label: "3M"  },
  { value: "6m",  label: "6M"  },
  { value: "12m", label: "12M" },
];
const SA_PERIOD_LABELS: Record<string, string> = {
  "3m":  "Last 3 Months",
  "6m":  "Last 6 Months",
  "12m": "Last 12 Months",
};

interface Props {
  data: SuperAdminAnalytics;
  visibleIds: string[];
  loading?: boolean;
  period: string;
  onPeriodChange: (p: string) => void;
}

export const SUPER_ADMIN_WIDGETS = {
  "sa-platform":         "Platform KPIs",
  "sa-health":           "Status Health",
  "sa-franchise-growth": "Franchise Growth",
  "sa-top-franchises":   "Top Franchises by Outlets",
  "sa-top-devices":      "Top Outlets by Devices",
  "sa-roles":            "User Role Distribution",
  "sa-recent":           "Recent Registrations",
};

function HealthCard({
  label, active, total, icon, color, loading = false,
}: {
  label: string;
  active: number;
  total: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 p-5">
        <div className="flex items-center gap-3 mb-4">
          <AnalyticsShimmer className="h-9 w-9 rounded-xl" />
          <div className="space-y-1.5 flex-1"><AnalyticsShimmer className="h-3.5 w-24" /><AnalyticsShimmer className="h-3 w-16" /></div>
          <div className="space-y-1.5"><AnalyticsShimmer className="h-3.5 w-16" /><AnalyticsShimmer className="h-3 w-12" /></div>
        </div>
        <AnalyticsShimmer className="h-1.5 w-full rounded-full" />
      </div>
    );
  }
  const pct = total === 0 ? 0 : Math.round((active / total) * 100);
  const inactive = total - active;
  return (
    <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>{icon}</div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{label}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{total} total</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[13px] font-bold text-emerald-500">{active} active</p>
          <p className="text-[11px] text-rose-400">{inactive} inactive</p>
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-white/6 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RecentRow({ name, code, status, createdAt }: {
  name: string; code: string; status: string; createdAt: string;
}) {
  const isActive = status === "ACTIVE";
  return (
    <div className="flex items-center gap-3 py-2.5 px-5 hover:bg-slate-50/50 dark:hover:bg-white/2 transition">
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-medium text-slate-700 dark:text-slate-300 truncate">{name}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{code}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`inline-flex items-center text-[10.5px] font-medium px-2 py-0.5 rounded-full ${
          isActive
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        }`}>{isActive ? "Active" : "Inactive"}</span>
        <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
          {new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

export function SuperAdminView({ data, visibleIds, loading = false, period, onPeriodChange }: Props) {
  const activePeriod = period || "12m";
  const periodLabel  = SA_PERIOD_LABELS[activePeriod] ?? activePeriod;
  // Defensive defaults — guards against stale cache / partial API responses
  const summary = data?.summary ?? {
    totalFranchises: 0, activeFranchises: 0, inactiveFranchises: 0,
    totalOutlets: 0,    activeOutlets: 0,    inactiveOutlets: 0,
    totalDevices: 0,    activeDevices: 0,    inactiveDevices: 0,
    totalUsers: 0,      usersByRole: {} as Record<string, number>,
  };
  const franchiseGrowth    = data?.franchiseGrowth    ?? [];
  const outletsByFranchise = data?.outletsByFranchise ?? [];
  const devicesByOutlet    = data?.devicesByOutlet    ?? [];
  const recentFranchises   = data?.recentFranchises   ?? [];
  const recentOutlets      = data?.recentOutlets      ?? [];

  const roleDonutData = Object.entries(summary.usersByRole ?? {})
    .map(([role, count]) => ({ name: role.replace(/_/g, " "), value: count as number }))
    .sort((a, b) => b.value - a.value);

  const widgetRenderers: Record<string, () => React.ReactNode> = {
    "sa-platform": () => (
      <section>
        <SectionTitle><Building2 className="w-3.5 h-3.5 text-indigo-500" />Platform Overview</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard loading={loading} label="Franchises" value={summary.totalFranchises} sub="On platform"   icon={<Building2          className="w-4 h-4 text-indigo-500"  />} accent="indigo"  />
          <MetricCard loading={loading} label="Outlets"    value={summary.totalOutlets}    sub="Across all"   icon={<Store              className="w-4 h-4 text-blue-500"    />} accent="blue"    />
          <MetricCard loading={loading} label="Devices"    value={summary.totalDevices}    sub="Registered"   icon={<MonitorSmartphone  className="w-4 h-4 text-violet-500"  />} accent="violet"  />
          <MetricCard loading={loading} label="Users"      value={summary.totalUsers}      sub="All roles"    icon={<Users              className="w-4 h-4 text-emerald-500" />} accent="emerald" />
        </div>
      </section>
    ),
    "sa-health": () => (
      <section>
        <SectionTitle><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Platform Health</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <HealthCard loading={loading} label="Franchises" active={summary.activeFranchises} total={summary.totalFranchises} icon={<Building2         className="w-4 h-4 text-indigo-500"  />} color="bg-indigo-50 dark:bg-indigo-500/10"  />
          <HealthCard loading={loading} label="Outlets"    active={summary.activeOutlets}    total={summary.totalOutlets}    icon={<Store             className="w-4 h-4 text-blue-500"    />} color="bg-blue-50 dark:bg-blue-500/10"      />
          <HealthCard loading={loading} label="Devices"    active={summary.activeDevices}    total={summary.totalDevices}    icon={<MonitorSmartphone className="w-4 h-4 text-violet-500"  />} color="bg-violet-50 dark:bg-violet-500/10"  />
        </div>
      </section>
    ),
    "sa-franchise-growth": () => (
      <section>
        <SectionTitle><TrendingUp className="w-3.5 h-3.5 text-indigo-500" />Franchise Growth</SectionTitle>
        <WidgetCard
          title="New Franchises"
          subtitle={`Monthly registrations — ${periodLabel.toLowerCase()}`}
          loading={loading} loadingHeight="h-[220px]"
        >
          {franchiseGrowth.length > 0
            ? <MonthlyCountChart data={franchiseGrowth} label="New Franchises" height={220} />
            : <EmptyState message="No franchise registrations in the selected period." />}
        </WidgetCard>
      </section>
    ),
    "sa-top-franchises": () => (
      <section>
        <SectionTitle><Building2 className="w-3.5 h-3.5 text-amber-500" />Top 5 Franchises by Outlets</SectionTitle>
        <WidgetCard loading={loading} loadingHeight="h-[220px]">
          {outletsByFranchise.length > 0
            ? <CountBarChart data={outletsByFranchise.map(f => ({ name: f.name || f.brandCode, count: f.outletCount }))} label="Outlets" height={220} />
            : <EmptyState message="No franchise data yet." />}
        </WidgetCard>
      </section>
    ),
    "sa-top-devices": () => (
      <section>
        <SectionTitle><MonitorSmartphone className="w-3.5 h-3.5 text-violet-500" />Top 5 Outlets by Devices</SectionTitle>
        <WidgetCard loading={loading} loadingHeight="h-[220px]">
          {devicesByOutlet.length > 0
            ? <CountBarChart data={devicesByOutlet.map(o => ({ name: o.name || o.outletCode, count: o.deviceCount }))} label="Devices" height={220} />
            : <EmptyState message="No device data yet." />}
        </WidgetCard>
      </section>
    ),
    "sa-roles": () => (
      <section>
        <SectionTitle><Users className="w-3.5 h-3.5 text-blue-500" />User Role Distribution</SectionTitle>
        <WidgetCard title="Roles" subtitle="All users across the platform grouped by role" loading={loading} loadingHeight="h-[220px]">
          {roleDonutData.length > 0
            ? <DonutChart data={roleDonutData} height={220} />
            : <EmptyState message="No user data yet." />}
        </WidgetCard>
      </section>
    ),
    "sa-recent": () => (
      <section>
        <SectionTitle><Clock className="w-3.5 h-3.5 text-slate-400" />Recent Registrations</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WidgetCard title="Recent Franchises" noPad loading={loading} loadingHeight="h-[200px]">
            {recentFranchises.length > 0
              ? <div className="divide-y divide-slate-50 dark:divide-white/4">
                  {recentFranchises.map(f => (
                    <RecentRow key={f._id} name={f.name} code={f.brandCode} status={f.status} createdAt={f.createdAt} />
                  ))}
                </div>
              : <EmptyState message="No franchises registered yet." />}
          </WidgetCard>
          <WidgetCard title="Recent Outlets" noPad loading={loading} loadingHeight="h-[200px]">
            {recentOutlets.length > 0
              ? <div className="divide-y divide-slate-50 dark:divide-white/4">
                  {recentOutlets.map(o => (
                    <RecentRow key={o._id} name={o.name} code={o.outletCode} status={o.status} createdAt={o.createdAt} />
                  ))}
                </div>
              : <EmptyState message="No outlets registered yet." />}
          </WidgetCard>
        </div>
      </section>
    ),
  };

  // Render in visibleIds order; pair sa-top-* side-by-side when adjacent
  const SIDE_PAIR = new Set(["sa-top-franchises", "sa-top-devices"]);
  const widgets: React.ReactNode[] = [];
  const processed = new Set<string>();
  for (let i = 0; i < visibleIds.length; i++) {
    const id = visibleIds[i];
    if (processed.has(id) || !widgetRenderers[id]) continue;
    const nextId = visibleIds[i + 1];
    if (SIDE_PAIR.has(id) && nextId && SIDE_PAIR.has(nextId) && !processed.has(nextId)) {
      widgets.push(
        <div key={`${id}+${nextId}`} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {widgetRenderers[id]()}
          {widgetRenderers[nextId]()}
        </div>
      );
      processed.add(id); processed.add(nextId); i++;
    } else {
      widgets.push(<Fragment key={id}>{widgetRenderers[id]()}</Fragment>);
      processed.add(id);
    }
  }

  return (
    <div className="space-y-5">
      {/* Global period selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
          Showing data for: <span className="font-semibold text-slate-700 dark:text-slate-200">{periodLabel}</span>
        </p>
        <PeriodSelector options={SA_PERIODS} value={activePeriod} onChange={onPeriodChange} />
      </div>
      {widgets}
    </div>
  );
}