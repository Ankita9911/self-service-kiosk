import { TrendingUp, ShoppingCart, Clock, BarChart2, Star, Percent } from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState, TopItemsList, PeriodSelector } from "./AnalyticsShared";
import { DualTrendChart, CategoryPieChart, StatusDonutChart, HourlyOrdersChart } from "./AnalyticsCharts";
import type { OutletManagerAnalytics } from "../types/analytics.types";

const OM_PERIODS = [
  { value: "today", label: "Today" },
  { value: "7d",    label: "7D"   },
  { value: "30d",   label: "30D"  },
  { value: "90d",   label: "90D"  },
];
const OM_PERIOD_LABELS: Record<string, string> = {
  today: "Today",
  "7d":  "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
};

interface Props {
  data: OutletManagerAnalytics;
  visibleIds: string[];
  loading?: boolean;
  period: string;
  onPeriodChange: (p: string) => void;
}

export const OUTLET_MANAGER_WIDGETS = {
  "om-summary":   "Outlet KPIs",
  "om-trend":     "Revenue Trend",
  "om-top-items": "Top Selling Items",
  "om-category":  "Category Revenue",
  "om-status":    "Order Status",
};

export function OutletManagerView({ data, visibleIds, loading = false, period, onPeriodChange }: Props) {
  const activePeriod = period || "7d";
  const isToday      = activePeriod === "today";
  const periodLabel  = OM_PERIOD_LABELS[activePeriod] ?? activePeriod;

  // Defensive defaults
  const summary = data?.summary ?? {
    revenue: 0, orders: 0, avgOrderValue: 0, cancellationRate: 0, peakHour: null,
  };
  const revenueTrend    = data?.revenueTrend    ?? [];
  const ordersPerHour   = data?.ordersPerHour   ?? [];
  const statusBreakdown = data?.statusBreakdown ?? {};
  const topItems        = data?.topItems        ?? [];
  const categoryRevenue = data?.categoryRevenue ?? [];

  const show = (id: string) => visibleIds.includes(id);
  const formatHour = (h: number | null) => h !== null ? `${h}:00 – ${h + 1}:00` : "—";

  return (
    <div className="space-y-5">

      {/* Period selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
          Showing data for: <span className="font-semibold text-slate-700 dark:text-slate-200">{periodLabel}</span>
        </p>
        <PeriodSelector options={OM_PERIODS} value={activePeriod} onChange={onPeriodChange} />
      </div>

      {/* ── Outlet KPIs ────────────────────────────────────────────────── */}
      {show("om-summary") && (
        <section>
          <SectionTitle><TrendingUp className="w-3.5 h-3.5 text-indigo-500" />Outlet Performance — {periodLabel}</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <MetricCard loading={loading} label="Revenue"           value={`₹${summary.revenue.toLocaleString("en-IN")}`} sub={periodLabel}   icon={<TrendingUp   className="w-4 h-4 text-indigo-500"  />} accent="indigo"  />
            <MetricCard loading={loading} label="Orders"            value={summary.orders}                                sub={periodLabel}   icon={<ShoppingCart className="w-4 h-4 text-blue-500"    />} accent="blue"    />
            <MetricCard loading={loading} label="Avg Order Value"   value={`₹${summary.avgOrderValue.toFixed(0)}`}        sub="Per order"     icon={<BarChart2    className="w-4 h-4 text-violet-500"  />} accent="violet"  />
            {isToday && (
              <MetricCard loading={loading} label="Peak Hour"       value={formatHour(summary.peakHour)}                  sub="Busiest today" icon={<Clock        className="w-4 h-4 text-emerald-500" />} accent="emerald" />
            )}
            <MetricCard loading={loading} label="Cancellation Rate" value={`${summary.cancellationRate}%`}                sub={periodLabel}   icon={<Percent      className="w-4 h-4 text-rose-500"    />} accent="rose"    />
          </div>
        </section>
      )}

      {/* ── Revenue Trend / Hourly Activity ───────────────────────────── */}
      {show("om-trend") && (
        <section>
          <SectionTitle>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            {isToday ? "Hourly Activity — Today" : `Revenue & Orders — ${periodLabel}`}
          </SectionTitle>
          <WidgetCard
            title={isToday ? "Orders Per Hour" : "Daily Performance"}
            subtitle={isToday
              ? "Order volume across today's hours"
              : `Revenue (left axis) and orders (right axis) — ${periodLabel.toLowerCase()}`}
            loading={loading} loadingHeight="h-[260px]"
          >
            {isToday
              ? (ordersPerHour.length > 0
                  ? <HourlyOrdersChart data={ordersPerHour} height={260} />
                  : <EmptyState message="No orders yet today." />)
              : (revenueTrend.length > 0
                  ? <DualTrendChart data={revenueTrend} height={260} />
                  : <EmptyState message={`No revenue data for ${periodLabel.toLowerCase()}.`} />)
            }
          </WidgetCard>
        </section>
      )}

      {/* ── Top Items + Category Revenue ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {show("om-top-items") && (
          <section className="flex flex-col">
            <SectionTitle><Star className="w-3.5 h-3.5 text-amber-500" />Top 5 Items — {periodLabel}</SectionTitle>
            <WidgetCard title="Best Sellers" subtitle={`Most sold items — ${periodLabel.toLowerCase()}`} noPad loading={loading} loadingHeight="h-[238px]" className="flex-1">
              {topItems.length > 0
                ? <TopItemsList items={topItems} loading={loading} />
                : <EmptyState message="No item sales data for this period." />}
            </WidgetCard>
          </section>
        )}
        {show("om-category") && (
          <section className="flex flex-col">
            <SectionTitle><BarChart2 className="w-3.5 h-3.5 text-violet-500" />Category Revenue — {periodLabel}</SectionTitle>
            <WidgetCard title="Revenue by Category" subtitle="Which categories drive the most sales" loading={loading} loadingHeight="h-[238px]" className="flex-1">
              {categoryRevenue.length > 0
                ? <CategoryPieChart data={categoryRevenue} />
                : <EmptyState message="No category data for this period." />}
            </WidgetCard>
          </section>
        )}
      </div>

      {/* ── Order Status ───────────────────────────────────────────────── */}
      {show("om-status") && (
        <section>
          <SectionTitle><ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />Order Status — {periodLabel}</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-start-2">
              <WidgetCard title="Status Distribution" subtitle="Order breakdown across all statuses" loading={loading} loadingHeight="h-[220px]">
                {Object.keys(statusBreakdown).length > 0
                  ? <StatusDonutChart breakdown={statusBreakdown} />
                  : <EmptyState message="No orders for this period." />}
              </WidgetCard>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
