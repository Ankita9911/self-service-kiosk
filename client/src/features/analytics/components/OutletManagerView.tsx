import { TrendingUp, ShoppingCart, Clock, BarChart2, Star, Percent } from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState, TopItemsList } from "./AnalyticsShared";
import { RevenueTrendChart, HourlyOrdersChart, CategoryPieChart, StatusDonutChart } from "./AnalyticsCharts";
import type { OutletManagerAnalytics } from "../types/analytics.types";

interface Props {
  data: OutletManagerAnalytics;
  visibleIds: string[];
  loading?: boolean;
}

export const OUTLET_MANAGER_WIDGETS = {
  "om-summary":      "Today's Summary",
  "om-revenue-week": "Revenue (Last 7 Days)",
  "om-hourly":       "Orders Per Hour",
  "om-status":       "Order Status Breakdown",
  "om-category":     "Category Revenue",
  "om-top-items":    "Top 5 Items",
};

export function OutletManagerView({ data, visibleIds, loading = false }: Props) {
  const { today, statusBreakdown, ordersPerHour, revenueLast7Days, topItems, categoryRevenue, cancellationRate, peakHour } = data;
  const show = (id: string) => visibleIds.includes(id);
  const formatHour = (h: number | null) => h !== null ? `${h}:00 – ${h + 1}:00` : "—";

  return (
    <div className="space-y-5">

      {show("om-summary") && (
        <section>
          <SectionTitle><TrendingUp className="w-3.5 h-3.5 text-indigo-500" />Today's Performance</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard loading={loading} label="Revenue Today"     value={`₹${today.revenue.toLocaleString("en-IN")}`} sub="This outlet"    icon={<TrendingUp   className="w-4 h-4 text-indigo-500"  />} accent="indigo"  />
            <MetricCard loading={loading} label="Orders Today"      value={today.orders}                                sub="All statuses"  icon={<ShoppingCart className="w-4 h-4 text-blue-500"    />} accent="blue"    />
            <MetricCard loading={loading} label="Avg Order Value"   value={`₹${today.avgOrderValue.toFixed(0)}`}       sub="Today"         icon={<BarChart2    className="w-4 h-4 text-violet-500"  />} accent="violet"  />
            <MetricCard loading={loading} label="Peak Hour"         value={formatHour(peakHour)}                       sub="Busiest today" icon={<Clock        className="w-4 h-4 text-emerald-500" />} accent="emerald" />
            <MetricCard loading={loading} label="Cancellation Rate" value={`${cancellationRate}%`}                     sub="All time"      icon={<Percent      className="w-4 h-4 text-rose-500"    />} accent="rose"    />
          </div>
        </section>
      )}

      {show("om-revenue-week") && (
        <section>
          <SectionTitle><TrendingUp className="w-3.5 h-3.5 text-indigo-500" />Revenue — Last 7 Days</SectionTitle>
          <WidgetCard title="Revenue" subtitle="Daily breakdown for this week" loading={loading} loadingHeight="h-[220px]">
            {revenueLast7Days.length > 0
              ? <RevenueTrendChart data={revenueLast7Days} dataKey="revenue" color="#6366f1" height={220} />
              : <EmptyState message="No revenue data for the past 7 days." />}
          </WidgetCard>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {show("om-hourly") && (
          <section>
            <SectionTitle><Clock className="w-3.5 h-3.5 text-blue-500" />Orders Per Hour Today</SectionTitle>
            <WidgetCard title="Hourly Volume" subtitle="Order distribution across today" loading={loading} loadingHeight="h-[200px]">
              {ordersPerHour.length > 0
                ? <HourlyOrdersChart data={ordersPerHour} height={200} />
                : <EmptyState message="No orders yet today." />}
            </WidgetCard>
          </section>
        )}
        {show("om-status") && (
          <section>
            <SectionTitle><ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />Order Status Breakdown</SectionTitle>
            <WidgetCard title="Status Distribution" loading={loading} loadingHeight="h-[200px]">
              {Object.keys(statusBreakdown).length > 0
                ? <StatusDonutChart breakdown={statusBreakdown} />
                : <EmptyState message="No orders yet." />}
            </WidgetCard>
          </section>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {show("om-category") && (
          <section>
            <SectionTitle><BarChart2 className="w-3.5 h-3.5 text-violet-500" />Category Revenue</SectionTitle>
            <WidgetCard title="Revenue by Category" loading={loading} loadingHeight="h-[220px]">
              {categoryRevenue.length > 0
                ? <CategoryPieChart data={categoryRevenue} />
                : <EmptyState message="No category data yet." />}
            </WidgetCard>
          </section>
        )}
        {show("om-top-items") && (
          <section>
            <SectionTitle><Star className="w-3.5 h-3.5 text-amber-500" />Top 5 Items</SectionTitle>
            <WidgetCard title="Best Sellers" noPad loading={loading} loadingHeight="h-[220px]">
              {topItems.length > 0
                ? <TopItemsList items={topItems} loading={loading} />
                : <EmptyState message="No item sales data yet." />}
            </WidgetCard>
          </section>
        )}
      </div>
    </div>
  );
}