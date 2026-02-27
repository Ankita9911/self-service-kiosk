import { TrendingUp, Store, Users, ShoppingCart, BarChart2, TrendingDown, Star } from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState, TopItemsList, OutletProgressList } from "./AnalyticsShared";
import { RevenueTrendChart, OutletRevenueChart } from "./AnalyticsCharts";
import type { SuperAdminAnalytics } from "../types/analytics.types";

interface Props {
  data: SuperAdminAnalytics;
  visibleIds: string[];
  loading?: boolean;
}

export const SUPER_ADMIN_WIDGETS = {
  "sa-summary":        "Summary Metrics",
  "sa-week":           "Week Comparison",
  "sa-revenue-trend":  "Revenue Trend (30d)",
  "sa-top-franchises": "Top Franchises",
  "sa-top-outlets":    "Top Outlets",
  "sa-top-items":      "Top Selling Items",
};

export function SuperAdminView({ data, visibleIds, loading = false }: Props) {
  const { summary, weekComparison, trends, topFranchises, topOutlets, topItems, monthlyGrowth } = data;
  const show = (id: string) => visibleIds.includes(id);

  return (
    <div className="space-y-5">

      {show("sa-summary") && (
        <section>
          <SectionTitle><TrendingUp className="w-3.5 h-3.5 text-indigo-500" />Platform Overview</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard loading={loading} label="Total Revenue"   value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`} sub="All time"             icon={<TrendingUp  className="w-4 h-4 text-indigo-500"  />} accent="indigo"  trend={{ value: monthlyGrowth, label: "monthly" }} />
            <MetricCard loading={loading} label="Total Orders"    value={summary.totalOrders.toLocaleString("en-IN")}        sub="All outlets"          icon={<ShoppingCart className="w-4 h-4 text-blue-500"    />} accent="blue"    />
            <MetricCard loading={loading} label="Avg Order Value" value={`₹${summary.avgOrderValue.toFixed(0)}`}             sub="Per transaction"      icon={<BarChart2    className="w-4 h-4 text-violet-500"  />} accent="violet"  />
            <MetricCard loading={loading} label="Franchises"      value={summary.totalFranchises}                            sub="Active partners"      icon={<Store        className="w-4 h-4 text-emerald-500" />} accent="emerald" />
            <MetricCard loading={loading} label="Outlets"         value={summary.totalOutlets}                               sub="Across all"           icon={<Store        className="w-4 h-4 text-amber-500"  />} accent="amber"   />
            {Object.entries(summary.usersByRole).map(([role, count]) => (
              <MetricCard key={role} loading={loading} label={role.replace(/_/g, " ")} value={count} sub="Users" icon={<Users className="w-4 h-4 text-rose-500" />} accent="rose" />
            ))}
          </div>
        </section>
      )}

      {show("sa-week") && (
        <section>
          <SectionTitle><BarChart2 className="w-3.5 h-3.5 text-blue-500" />This Week vs Last Week</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard loading={loading} label="This Week Revenue" value={`₹${weekComparison.thisWeek.revenue.toLocaleString("en-IN")}`} sub={`${weekComparison.thisWeek.orders} orders`}  icon={<TrendingUp   className="w-4 h-4 text-emerald-500" />} accent="emerald" />
            <MetricCard loading={loading} label="Last Week Revenue" value={`₹${weekComparison.lastWeek.revenue.toLocaleString("en-IN")}`} sub={`${weekComparison.lastWeek.orders} orders`}  icon={<TrendingDown className="w-4 h-4 text-rose-500"    />} accent="rose"    />
            <MetricCard loading={loading} label="Revenue Growth"    value={`${weekComparison.revenueGrowth > 0 ? "+" : ""}${weekComparison.revenueGrowth}%`} sub="Week over week" icon={<TrendingUp className="w-4 h-4 text-indigo-500" />} accent="indigo" trend={{ value: weekComparison.revenueGrowth }} />
          </div>
        </section>
      )}

      {show("sa-revenue-trend") && (
        <section>
          <SectionTitle><TrendingUp className="w-3.5 h-3.5 text-indigo-500" />Revenue Trend — Last 30 Days</SectionTitle>
          <WidgetCard title="Revenue" subtitle="Daily revenue over the last 30 days" loading={loading} loadingHeight="h-[240px]">
            {trends.revenueLast30Days.length > 0
              ? <RevenueTrendChart data={trends.revenueLast30Days} dataKey="revenue" color="#6366f1" height={240} />
              : <EmptyState message="No revenue data for the last 30 days." />}
          </WidgetCard>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {show("sa-top-franchises") && (
          <section>
            <SectionTitle><Star className="w-3.5 h-3.5 text-amber-500" />Top 5 Franchises by Revenue</SectionTitle>
            <WidgetCard loading={loading} loadingHeight="h-[220px]">
              {topFranchises.length > 0
                ? <OutletRevenueChart data={topFranchises.map((f) => ({ name: f.name || f.brandCode, revenue: f.revenue, orders: f.orders }))} />
                : <EmptyState message="No franchise data yet." />}
            </WidgetCard>
          </section>
        )}
        {show("sa-top-outlets") && (
          <section>
            <SectionTitle><Star className="w-3.5 h-3.5 text-blue-500" />Top 5 Outlets by Revenue</SectionTitle>
            <WidgetCard loading={loading} loadingHeight="h-[220px]">
              {topOutlets.length > 0
                ? <OutletRevenueChart data={topOutlets.map((o) => ({ name: o.name || o.outletCode, revenue: o.revenue, orders: o.orders }))} />
                : <EmptyState message="No outlet data yet." />}
            </WidgetCard>
          </section>
        )}
      </div>

      {show("sa-top-items") && (
        <section>
          <SectionTitle><Star className="w-3.5 h-3.5 text-emerald-500" />Top 10 Selling Items</SectionTitle>
          <WidgetCard title="Best Sellers" noPad loading={loading} loadingHeight="h-[320px]">
            {topItems.length > 0
              ? <TopItemsList items={topItems} loading={loading} count={10} />
              : <EmptyState message="No item data yet." />}
          </WidgetCard>
        </section>
      )}
    </div>
  );
}