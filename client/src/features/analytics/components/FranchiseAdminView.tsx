import {
    TrendingUp,
    Store,
    Users,
    ShoppingCart,
    BarChart2,
    Star,
    Percent,
} from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState } from "./AnalyticsShared";
import {
    RevenueTrendChart,
    OutletRevenueChart,
    CategoryPieChart,
    StatusDonutChart,
} from "./AnalyticsCharts";
import type { FranchiseAdminAnalytics } from "../types/analytics.types";

interface Props {
    data: FranchiseAdminAnalytics;
    visibleIds: string[];
}

export const FRANCHISE_ADMIN_WIDGETS = {
    "fa-summary": "Summary Metrics",
    "fa-revenue-trend": "Revenue Trend (30d)",
    "fa-outlets": "Outlet Performance",
    "fa-category": "Category Revenue",
    "fa-top-items": "Top Selling Items",
    "fa-status": "Order Status Breakdown",
};

export function FranchiseAdminView({ data, visibleIds }: Props) {
    const { summary, revenueTrend, outletBreakdown, topItems, categoryRevenue, statusBreakdown } = data;
    const show = (id: string) => visibleIds.includes(id);

    return (
        <div className="space-y-6">
            {show("fa-summary") && (
                <section>
                    <SectionTitle>
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        Franchise Overview
                    </SectionTitle>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <MetricCard label="Total Revenue" value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`} sub="All outlets" icon={<TrendingUp className="w-4 h-4 text-orange-500" />} accent="orange" />
                        <MetricCard label="Total Orders" value={summary.totalOrders.toLocaleString()} sub="All time" icon={<ShoppingCart className="w-4 h-4 text-blue-500" />} accent="blue" />
                        <MetricCard label="Avg Order Value" value={`₹${summary.avgOrderValue.toFixed(0)}`} sub="Per order" icon={<BarChart2 className="w-4 h-4 text-violet-500" />} accent="violet" />
                        <MetricCard label="Outlets" value={summary.totalOutlets} sub="In franchise" icon={<Store className="w-4 h-4 text-emerald-500" />} accent="emerald" />
                        <MetricCard label="Users" value={summary.totalUsers} sub="Staff across outlets" icon={<Users className="w-4 h-4 text-amber-500" />} accent="amber" />
                        <MetricCard label="Cancellation Rate" value={`${summary.cancellationRate}%`} sub="All orders" icon={<Percent className="w-4 h-4 text-rose-500" />} accent="rose" />
                    </div>
                </section>
            )}

            {show("fa-revenue-trend") && (
                <section>
                    <SectionTitle><TrendingUp className="w-4 h-4 text-orange-500" /> Revenue Trend — 30 Days</SectionTitle>
                    <WidgetCard>
                        {revenueTrend.length > 0 ? (
                            <RevenueTrendChart data={revenueTrend} dataKey="revenue" color="#f97316" height={240} />
                        ) : (
                            <EmptyState message="No revenue data for 30 days." />
                        )}
                    </WidgetCard>
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {show("fa-outlets") && (
                    <section>
                        <SectionTitle><Store className="w-4 h-4 text-blue-500" /> Outlet Revenue</SectionTitle>
                        <WidgetCard>
                            {outletBreakdown.length > 0 ? (
                                <>
                                    <OutletRevenueChart data={outletBreakdown.map((o) => ({ name: o.name || o.outletCode, revenue: o.revenue, orders: o.orders }))} />
                                    <div className="mt-3 space-y-1">
                                        {outletBreakdown.map((o) => (
                                            <div key={String(o.outletId)} className="flex items-center gap-2 text-xs">
                                                <span className="flex-1 text-slate-600 truncate font-satoshi">{o.name || o.outletCode}</span>
                                                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(o.contributionPercent, 100)}%` }} />
                                                </div>
                                                <span className="text-slate-400 w-10 text-right font-satoshi">{o.contributionPercent}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <EmptyState message="No outlet data yet." />
                            )}
                        </WidgetCard>
                    </section>
                )}

                {show("fa-category") && (
                    <section>
                        <SectionTitle><BarChart2 className="w-4 h-4 text-violet-500" /> Category Revenue</SectionTitle>
                        <WidgetCard>
                            {categoryRevenue.length > 0 ? (
                                <CategoryPieChart data={categoryRevenue} />
                            ) : (
                                <EmptyState message="No category data yet." />
                            )}
                        </WidgetCard>
                    </section>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {show("fa-top-items") && (
                    <section>
                        <SectionTitle><Star className="w-4 h-4 text-amber-500" /> Top 5 Selling Items</SectionTitle>
                        <WidgetCard>
                            {topItems.length > 0 ? (
                                <div className="space-y-2">
                                    {topItems.map((item, i) => (
                                        <div key={String(item._id)} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-xs font-clash-semibold flex items-center justify-center">{i + 1}</span>
                                            <span className="flex-1 text-sm font-satoshi text-slate-700 truncate">{item.name}</span>
                                            <span className="text-xs text-slate-400">{item.totalSold} sold</span>
                                            <span className="text-xs font-satoshi-medium text-slate-700 ml-2">₹{item.totalRevenue.toLocaleString("en-IN")}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No item data yet." />
                            )}
                        </WidgetCard>
                    </section>
                )}

                {show("fa-status") && (
                    <section>
                        <SectionTitle><ShoppingCart className="w-4 h-4 text-emerald-500" /> Order Status</SectionTitle>
                        <WidgetCard>
                            {Object.keys(statusBreakdown).length > 0 ? (
                                <StatusDonutChart breakdown={statusBreakdown} />
                            ) : (
                                <EmptyState message="No order status data." />
                            )}
                        </WidgetCard>
                    </section>
                )}
            </div>
        </div>
    );
}
