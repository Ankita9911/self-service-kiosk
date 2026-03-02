import { Fragment } from "react";
import { TrendingUp, Store, Users, ShoppingCart, BarChart2, Star, Percent, Trophy } from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState, TopItemsList, OutletLeaderboard, PeriodSelector } from "./AnalyticsShared";
import { DualTrendChart, CategoryPieChart, StatusDonutChart } from "./AnalyticsCharts";
import type { FranchiseAdminAnalytics } from "../types/analytics.types";

const FA_PERIODS = [
  { value: "7d",  label: "7D"  },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "12m", label: "12M" },
];
const FA_PERIOD_LABELS: Record<string, string> = {
  "7d":  "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
  "12m": "Last 12 Months",
};

interface Props {
  data: FranchiseAdminAnalytics;
  visibleIds: string[];
  loading?: boolean;
  period: string;
  onPeriodChange: (p: string) => void;
}

export const FRANCHISE_ADMIN_WIDGETS = {
  "fa-summary":       "Franchise KPIs",
  "fa-revenue-trend": "Revenue & Orders Trend",
  "fa-outlets":       "Outlet Leaderboard",
  "fa-top-items":     "Top Selling Items",
  "fa-category":      "Category Revenue",
  "fa-status":        "Order Status",
};

export function FranchiseAdminView({ data, visibleIds, loading = false, period, onPeriodChange }: Props) {
  const activePeriod = period || "30d";
  const periodLabel  = FA_PERIOD_LABELS[activePeriod] ?? activePeriod;

  // Defensive defaults — guards against stale cache / partial responses
  const summary = data?.summary ?? {
    totalRevenue: 0, totalOrders: 0, avgOrderValue: 0,
    totalOutlets: 0, totalUsers: 0, cancellationRate: 0,
  };
  const revenueTrend    = data?.revenueTrend    ?? [];
  const outletBreakdown = data?.outletBreakdown ?? [];
  const topItems        = data?.topItems        ?? [];
  const categoryRevenue = data?.categoryRevenue ?? [];
  const statusBreakdown = data?.statusBreakdown ?? {};

  const widgetRenderers: Record<string, () => React.ReactNode> = {
    "fa-summary": () => (
      <section>
        <SectionTitle><TrendingUp className="w-3.5 h-3.5 text-indigo-500" />Franchise Overview</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MetricCard loading={loading} label="Total Revenue"     value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`} sub="All outlets"    icon={<TrendingUp   className="w-4 h-4 text-indigo-500"  />} accent="indigo"  />
          <MetricCard loading={loading} label="Total Orders"      value={summary.totalOrders.toLocaleString()}               sub="All time"       icon={<ShoppingCart className="w-4 h-4 text-blue-500"    />} accent="blue"    />
          <MetricCard loading={loading} label="Avg Order Value"   value={`₹${summary.avgOrderValue.toFixed(0)}`}             sub="Per order"      icon={<BarChart2    className="w-4 h-4 text-violet-500"  />} accent="violet"  />
          <MetricCard loading={loading} label="Outlets"           value={summary.totalOutlets}                                sub="In franchise"   icon={<Store        className="w-4 h-4 text-emerald-500" />} accent="emerald" />
          <MetricCard loading={loading} label="Staff"             value={summary.totalUsers}                                  sub="Across outlets" icon={<Users        className="w-4 h-4 text-amber-500"  />} accent="amber"   />
          <MetricCard loading={loading} label="Cancellation Rate" value={`${summary.cancellationRate}%`}                     sub="Stale orders"   icon={<Percent      className="w-4 h-4 text-rose-500"    />} accent="rose"    />
        </div>
      </section>
    ),
    "fa-revenue-trend": () => (
      <section>
        <SectionTitle><TrendingUp className="w-3.5 h-3.5 text-indigo-500" />Revenue & Orders — {periodLabel}</SectionTitle>
        <WidgetCard
          title="Daily Performance"
          subtitle={`Revenue (left axis) and order volume (right axis) — ${periodLabel.toLowerCase()}`}
          loading={loading} loadingHeight="h-[260px]"
        >
          {revenueTrend.length > 0
            ? <DualTrendChart data={revenueTrend} height={260} />
            : <EmptyState message="No trend data available for the last 30 days." />}
        </WidgetCard>
      </section>
    ),
    "fa-outlets": () => (
      <section>
        <SectionTitle><Trophy className="w-3.5 h-3.5 text-amber-500" />Outlet Leaderboard</SectionTitle>
        <WidgetCard
          title="Revenue by Outlet"
          subtitle="Ranked by total revenue — each bar shows percentage contribution across the franchise"
          noPad loading={loading} loadingHeight="h-[260px]"
        >
          {outletBreakdown.length > 0
            ? <OutletLeaderboard outlets={outletBreakdown} loading={loading} />
            : <EmptyState message="No outlet order data yet." />}
        </WidgetCard>
      </section>
    ),
    "fa-top-items": () => (
      <section>
        <SectionTitle><Star className="w-3.5 h-3.5 text-amber-500" />Top 5 Selling Items</SectionTitle>
        <WidgetCard title="Best Sellers" subtitle="Most sold items across all outlets" noPad loading={loading} loadingHeight="h-[238px]">
          {topItems.length > 0
            ? <TopItemsList items={topItems} loading={loading} />
            : <EmptyState message="No item sales data yet." />}
        </WidgetCard>
      </section>
    ),
    "fa-category": () => (
      <section>
        <SectionTitle><BarChart2 className="w-3.5 h-3.5 text-violet-500" />Category Revenue</SectionTitle>
        <WidgetCard title="Revenue by Category" subtitle="Which food categories drive the most sales" loading={loading} loadingHeight="h-[238px]">
          {categoryRevenue.length > 0
            ? <CategoryPieChart data={categoryRevenue} />
            : <EmptyState message="No category revenue data yet." />}
        </WidgetCard>
      </section>
    ),
    "fa-status": () => (
      <section>
        <SectionTitle><ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />Order Status Breakdown</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-start-2">
            <WidgetCard title="Order Status" subtitle="Distribution across all order statuses" loading={loading} loadingHeight="h-[220px]">
              {Object.keys(statusBreakdown).length > 0
                ? <StatusDonutChart breakdown={statusBreakdown} />
                : <EmptyState message="No order status data yet." />}
            </WidgetCard>
          </div>
        </div>
      </section>
    ),
  };

  // Render in visibleIds order; pair fa-top-items + fa-category side-by-side when adjacent
  const SIDE_PAIR = new Set(["fa-top-items", "fa-category"]);
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
      {/* Period selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
          Showing data for: <span className="font-semibold text-slate-700 dark:text-slate-200">{periodLabel}</span>
        </p>
        <PeriodSelector options={FA_PERIODS} value={activePeriod} onChange={onPeriodChange} />
      </div>
      {widgets}
    </div>
  );
}