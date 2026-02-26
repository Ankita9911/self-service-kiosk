import {
    TrendingUp,
    Store,
    Users,
    ShoppingCart,
    BarChart2,
    TrendingDown,
    Star,
} from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState } from "./AnalyticsShared";
import {
    RevenueTrendChart,
    OutletRevenueChart,
} from "./AnalyticsCharts";
import type { SuperAdminAnalytics } from "../types/analytics.types";

interface Props {
    data: SuperAdminAnalytics;
    visibleIds: string[];
}

export const SUPER_ADMIN_WIDGETS = {
    "sa-summary": "Summary Metrics",
    "sa-week": "Week Comparison",
    "sa-revenue-trend": "Revenue Trend (30d)",
    "sa-top-franchises": "Top Franchises",
    "sa-top-outlets": "Top Outlets",
    "sa-top-items": "Top Selling Items",
};

export function SuperAdminView({ data, visibleIds }: Props) {
    const {
        summary,
        weekComparison,
        trends,
        topFranchises,
        topOutlets,
        topItems,
        monthlyGrowth,
    } = data;

    const show = (id: string) => visibleIds.includes(id);

    return (
        <div className="space-y-6">
            {/* ── Summary ── */}
            {show("sa-summary") && (
                <section>
                    <SectionTitle>
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        Platform Overview
                    </SectionTitle>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <MetricCard
                            label="Total Revenue"
                            value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
                            sub="All time"
                            icon={<TrendingUp className="w-4 h-4 text-orange-500" />}
                            accent="orange"
                            trend={{ value: monthlyGrowth, label: "monthly" }}
                        />
                        <MetricCard
                            label="Total Orders"
                            value={summary.totalOrders.toLocaleString("en-IN")}
                            sub="All outlets"
                            icon={<ShoppingCart className="w-4 h-4 text-blue-500" />}
                            accent="blue"
                        />
                        <MetricCard
                            label="Avg Order Value"
                            value={`₹${summary.avgOrderValue.toFixed(0)}`}
                            sub="Per transaction"
                            icon={<BarChart2 className="w-4 h-4 text-violet-500" />}
                            accent="violet"
                        />
                        <MetricCard
                            label="Franchises"
                            value={summary.totalFranchises}
                            sub="Active partners"
                            icon={<Store className="w-4 h-4 text-emerald-500" />}
                            accent="emerald"
                        />
                        <MetricCard
                            label="Outlets"
                            value={summary.totalOutlets}
                            sub="Across all"
                            icon={<Store className="w-4 h-4 text-amber-500" />}
                            accent="amber"
                        />
                        {Object.entries(summary.usersByRole).map(([role, count]) => (
                            <MetricCard
                                key={role}
                                label={role.replace(/_/g, " ")}
                                value={count}
                                sub="Users"
                                icon={<Users className="w-4 h-4 text-rose-500" />}
                                accent="rose"
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Week Comparison ── */}
            {show("sa-week") && (
                <section>
                    <SectionTitle>
                        <BarChart2 className="w-4 h-4 text-blue-500" />
                        This Week vs Last Week
                    </SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <MetricCard
                            label="This Week Revenue"
                            value={`₹${weekComparison.thisWeek.revenue.toLocaleString("en-IN")}`}
                            sub={`${weekComparison.thisWeek.orders} orders`}
                            icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                            accent="emerald"
                        />
                        <MetricCard
                            label="Last Week Revenue"
                            value={`₹${weekComparison.lastWeek.revenue.toLocaleString("en-IN")}`}
                            sub={`${weekComparison.lastWeek.orders} orders`}
                            icon={<TrendingDown className="w-4 h-4 text-rose-500" />}
                            accent="rose"
                        />
                        <MetricCard
                            label="Revenue Growth"
                            value={`${weekComparison.revenueGrowth > 0 ? "+" : ""}${weekComparison.revenueGrowth}%`}
                            sub="Week over week"
                            icon={<TrendingUp className="w-4 h-4 text-orange-500" />}
                            accent="orange"
                            trend={{ value: weekComparison.revenueGrowth }}
                        />
                    </div>
                </section>
            )}

            {/* ── Revenue Trend ── */}
            {show("sa-revenue-trend") && (
                <section>
                    <SectionTitle>
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        Revenue Trend — Last 30 Days
                    </SectionTitle>
                    <WidgetCard>
                        {trends.revenueLast30Days.length > 0 ? (
                            <RevenueTrendChart
                                data={trends.revenueLast30Days}
                                dataKey="revenue"
                                color="#f97316"
                                height={240}
                            />
                        ) : (
                            <EmptyState message="No revenue data for the last 30 days." />
                        )}
                    </WidgetCard>
                </section>
            )}

            {/* ── Top Franchises + Top Outlets ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {show("sa-top-franchises") && (
                    <section>
                        <SectionTitle>
                            <Star className="w-4 h-4 text-amber-500" />
                            Top 5 Franchises by Revenue
                        </SectionTitle>
                        <WidgetCard>
                            {topFranchises.length > 0 ? (
                                <OutletRevenueChart data={topFranchises.map((f) => ({ name: f.name || f.brandCode, revenue: f.revenue, orders: f.orders }))} />
                            ) : (
                                <EmptyState message="No franchise data yet." />
                            )}
                        </WidgetCard>
                    </section>
                )}

                {show("sa-top-outlets") && (
                    <section>
                        <SectionTitle>
                            <Star className="w-4 h-4 text-blue-500" />
                            Top 5 Outlets by Revenue
                        </SectionTitle>
                        <WidgetCard>
                            {topOutlets.length > 0 ? (
                                <OutletRevenueChart data={topOutlets.map((o) => ({ name: o.name || o.outletCode, revenue: o.revenue, orders: o.orders }))} />
                            ) : (
                                <EmptyState message="No outlet data yet." />
                            )}
                        </WidgetCard>
                    </section>
                )}
            </div>

            {/* ── Top Items ── */}
            {show("sa-top-items") && (
                <section>
                    <SectionTitle>
                        <Star className="w-4 h-4 text-emerald-500" />
                        Top 10 Selling Items
                    </SectionTitle>
                    <WidgetCard>
                        {topItems.length > 0 ? (
                            <div className="space-y-2">
                                {topItems.map((item, i) => (
                                    <div
                                        key={String(item._id)}
                                        className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0"
                                    >
                                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-clash-semibold flex items-center justify-center flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="flex-1 text-sm font-satoshi text-slate-700 truncate">
                                            {item.name}
                                        </span>
                                        <span className="text-xs text-slate-400 font-satoshi">
                                            {item.totalSold} sold
                                        </span>
                                        <span className="text-xs font-satoshi-medium text-slate-700 ml-2">
                                            ₹{item.totalRevenue.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No item data yet." />
                        )}
                    </WidgetCard>
                </section>
            )}
        </div>
    );
}
