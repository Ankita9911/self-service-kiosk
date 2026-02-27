import { TrendingUp, Store, Users, ShoppingCart, BarChart2, Star, Percent } from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState, TopItemsList, OutletProgressList } from "./AnalyticsShared";
import { RevenueTrendChart, OutletRevenueChart, CategoryPieChart, StatusDonutChart } from "./AnalyticsCharts";
import type { FranchiseAdminAnalytics } from "../types/analytics.types";

interface Props {
  data: FranchiseAdminAnalytics;
  visibleIds: string[];
  loading?: boolean;
}

export const FRANCHISE_ADMIN_WIDGETS = {
  "fa-summary":       "Summary Metrics",
  "fa-revenue-trend": "Revenue Trend (30d)",
  "fa-outlets":       "Outlet Performance",
  "fa-category":      "Category Revenue",
  "fa-top-items":     "Top Selling Items",
  "fa-status":        "Order Status Breakdown",
};

export function FranchiseAdminView({ data, visibleIds, loading = false }: Props) {
  const { summary, revenueTrend, outletBreakdown, topItems, categoryRevenue, statusBreakdown } = data;
  const show = (id: string) => visibleIds.includes(id);

  return (
    <div className="space-y-5">

      {show("fa-summary") && (
        <section>
          <SectionTitle><TrendingUp className="w-3.5 h-3.5 text-indigo-500" />Franchise Overview</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard loading={loading} label="Total Revenue"     value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`} sub="All outlets"     icon={<TrendingUp   className="w-4 h-4 text-indigo-500"  />} accent="indigo"  />
            <MetricCard loading={loading} label="Total Orders"      value={summary.totalOrders.toLocaleString()}               sub="All time"        icon={<ShoppingCart className="w-4 h-4 text-blue-500"    />} accent="blue"    />
            <MetricCard loading={loading} label="Avg Order Value"   value={`₹${summary.avgOrderValue.toFixed(0)}`}            sub="Per order"       icon={<BarChart2    className="w-4 h-4 text-violet-500"  />} accent="violet"  />
            <MetricCard loading={loading} label="Outlets"           value={summary.totalOutlets}                               sub="In franchise"    icon={<Store        className="w-4 h-4 text-emerald-500" />} accent="emerald" />
            <MetricCard loading={loading} label="Staff"             value={summary.totalUsers}                                 sub="Across outlets"  icon={<Users        className="w-4 h-4 text-amber-500"  />} accent="amber"   />
            <MetricCard loading={loading} label="Cancellation Rate" value={`${summary.cancellationRate}%`}                    sub="All orders"      icon={<Percent      className="w-4 h-4 text-rose-500"    />} accent="rose"    />
          </div>
        </section>
      )}

      {show("fa-revenue-trend") && (
        <section>
          <SectionTitle><TrendingUp className="w-3.5 h-3.5 text-indigo-500" />Revenue Trend — 30 Days</SectionTitle>
          <WidgetCard title="Revenue" subtitle="Daily revenue across all outlets" loading={loading} loadingHeight="h-[240px]">
            {revenueTrend.length > 0
              ? <RevenueTrendChart data={revenueTrend} dataKey="revenue" color="#6366f1" height={240} />
              : <EmptyState message="No revenue data for 30 days." />}
          </WidgetCard>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {show("fa-outlets") && (
          <section>
            <SectionTitle><Store className="w-3.5 h-3.5 text-blue-500" />Outlet Performance</SectionTitle>
            <WidgetCard title="Revenue by Outlet" subtitle="Contribution across locations" noPad loading={loading} loadingHeight="h-[260px]">
              {outletBreakdown.length > 0 ? (
                <>
                  <div className="p-5 pb-0">
                    <OutletRevenueChart data={outletBreakdown.map((o) => ({ name: o.name || o.outletCode, revenue: o.revenue, orders: o.orders }))} />
                  </div>
                  <OutletProgressList outlets={outletBreakdown} loading={loading} />
                </>
              ) : <EmptyState message="No outlet data yet." />}
            </WidgetCard>
          </section>
        )}
        {show("fa-category") && (
          <section>
            <SectionTitle><BarChart2 className="w-3.5 h-3.5 text-violet-500" />Category Revenue</SectionTitle>
            <WidgetCard title="Revenue by Category" loading={loading} loadingHeight="h-[220px]">
              {categoryRevenue.length > 0
                ? <CategoryPieChart data={categoryRevenue} />
                : <EmptyState message="No category data yet." />}
            </WidgetCard>
          </section>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {show("fa-top-items") && (
          <section>
            <SectionTitle><Star className="w-3.5 h-3.5 text-amber-500" />Top 5 Selling Items</SectionTitle>
            <WidgetCard title="Best Sellers" noPad loading={loading} loadingHeight="h-[220px]">
              {topItems.length > 0
                ? <TopItemsList items={topItems} loading={loading} />
                : <EmptyState message="No item data yet." />}
            </WidgetCard>
          </section>
        )}
        {show("fa-status") && (
          <section>
            <SectionTitle><ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />Order Status Breakdown</SectionTitle>
            <WidgetCard title="Order Status" loading={loading} loadingHeight="h-[200px]">
              {Object.keys(statusBreakdown).length > 0
                ? <StatusDonutChart breakdown={statusBreakdown} />
                : <EmptyState message="No order status data." />}
            </WidgetCard>
          </section>
        )}
      </div>
    </div>
  );
}