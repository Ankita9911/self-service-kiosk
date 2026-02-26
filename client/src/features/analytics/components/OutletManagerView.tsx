import {
    TrendingUp,
    ShoppingCart,
    Clock,
    BarChart2,
    Star,
    Percent,
} from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState } from "./AnalyticsShared";
import {
    RevenueTrendChart,
    HourlyOrdersChart,
    CategoryPieChart,
    StatusDonutChart,
} from "./AnalyticsCharts";
import type { OutletManagerAnalytics } from "../types/analytics.types";

interface Props {
    data: OutletManagerAnalytics;
    visibleIds: string[];
}

export const OUTLET_MANAGER_WIDGETS = {
    "om-summary": "Today's Summary",
    "om-revenue-week": "Revenue (Last 7 Days)",
    "om-hourly": "Orders Per Hour",
    "om-status": "Order Status Breakdown",
    "om-category": "Category Revenue",
    "om-top-items": "Top 5 Items",
};

export function OutletManagerView({ data, visibleIds }: Props) {
    const {
        today,
        statusBreakdown,
        ordersPerHour,
        revenueLast7Days,
        topItems,
        categoryRevenue,
        cancellationRate,
        peakHour,
    } = data;

    const show = (id: string) => visibleIds.includes(id);

    const formatHour = (h: number | null) => {
        if (h === null) return "—";
        return `${h}:00 – ${h + 1}:00`;
    };

    return (
        <div className="space-y-6">
            {show("om-summary") && (
                <section>
                    <SectionTitle>
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        Today's Performance
                    </SectionTitle>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <MetricCard label="Revenue Today" value={`₹${today.revenue.toLocaleString("en-IN")}`} sub="This outlet" icon={<TrendingUp className="w-4 h-4 text-orange-500" />} accent="orange" />
                        <MetricCard label="Orders Today" value={today.orders} sub="All statuses" icon={<ShoppingCart className="w-4 h-4 text-blue-500" />} accent="blue" />
                        <MetricCard label="Avg Order Value" value={`₹${today.avgOrderValue.toFixed(0)}`} sub="Today" icon={<BarChart2 className="w-4 h-4 text-violet-500" />} accent="violet" />
                        <MetricCard label="Peak Hour" value={formatHour(peakHour)} sub="Busiest today" icon={<Clock className="w-4 h-4 text-emerald-500" />} accent="emerald" />
                        <MetricCard label="Cancellation Rate" value={`${cancellationRate}%`} sub="All time" icon={<Percent className="w-4 h-4 text-rose-500" />} accent="rose" />
                    </div>
                </section>
            )}

            {show("om-revenue-week") && (
                <section>
                    <SectionTitle>
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        Revenue — Last 7 Days
                    </SectionTitle>
                    <WidgetCard>
                        {revenueLast7Days.length > 0 ? (
                            <RevenueTrendChart data={revenueLast7Days} dataKey="revenue" color="#f97316" height={220} />
                        ) : (
                            <EmptyState message="No revenue data for the past 7 days." />
                        )}
                    </WidgetCard>
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {show("om-hourly") && (
                    <section>
                        <SectionTitle>
                            <Clock className="w-4 h-4 text-blue-500" />
                            Orders Per Hour Today
                        </SectionTitle>
                        <WidgetCard>
                            {ordersPerHour.length > 0 ? (
                                <HourlyOrdersChart data={ordersPerHour} height={200} />
                            ) : (
                                <EmptyState message="No orders yet today." />
                            )}
                        </WidgetCard>
                    </section>
                )}

                {show("om-status") && (
                    <section>
                        <SectionTitle>
                            <ShoppingCart className="w-4 h-4 text-emerald-500" />
                            Order Status Breakdown
                        </SectionTitle>
                        <WidgetCard>
                            {Object.keys(statusBreakdown).length > 0 ? (
                                <StatusDonutChart breakdown={statusBreakdown} />
                            ) : (
                                <EmptyState message="No orders yet." />
                            )}
                        </WidgetCard>
                    </section>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {show("om-category") && (
                    <section>
                        <SectionTitle>
                            <BarChart2 className="w-4 h-4 text-violet-500" />
                            Category Revenue
                        </SectionTitle>
                        <WidgetCard>
                            {categoryRevenue.length > 0 ? (
                                <CategoryPieChart data={categoryRevenue} />
                            ) : (
                                <EmptyState message="No category data yet." />
                            )}
                        </WidgetCard>
                    </section>
                )}

                {show("om-top-items") && (
                    <section>
                        <SectionTitle>
                            <Star className="w-4 h-4 text-amber-500" />
                            Top 5 Items
                        </SectionTitle>
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
                                <EmptyState message="No item sales data yet." />
                            )}
                        </WidgetCard>
                    </section>
                )}
            </div>
        </div>
    );
}
