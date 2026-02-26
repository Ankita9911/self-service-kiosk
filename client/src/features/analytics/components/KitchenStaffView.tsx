import { ChefHat, Clock, CheckCircle, AlertTriangle, BarChart2 } from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState } from "./AnalyticsShared";
import { HourlyOrdersChart } from "./AnalyticsCharts";
import type { KitchenStaffAnalytics } from "../types/analytics.types";

interface Props {
    data: KitchenStaffAnalytics;
    visibleIds: string[];
}

export const KITCHEN_STAFF_WIDGETS = {
    "ks-summary": "Kitchen Summary",
    "ks-hourly": "Orders Per Hour",
    "ks-pending": "Longest Pending Order",
};

export function KitchenStaffView({ data, visibleIds }: Props) {
    const { queueCount, completedToday, peakHour, ordersPerHour, oldestPendingOrder, avgPrepTimeMinutes } = data;
    const show = (id: string) => visibleIds.includes(id);

    const formatHour = (h: number | null) => h !== null ? `${h}:00 – ${h + 1}:00` : "—";

    return (
        <div className="space-y-6">
            {show("ks-summary") && (
                <section>
                    <SectionTitle>
                        <ChefHat className="w-4 h-4 text-orange-500" />
                        Kitchen Dashboard
                    </SectionTitle>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <MetricCard
                            label="In Queue"
                            value={queueCount}
                            sub="Orders in kitchen"
                            icon={<ChefHat className="w-4 h-4 text-orange-500" />}
                            accent="orange"
                        />
                        <MetricCard
                            label="Completed Today"
                            value={completedToday}
                            sub="Ready / Picked up"
                            icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
                            accent="emerald"
                        />
                        <MetricCard
                            label="Peak Hour"
                            value={formatHour(peakHour)}
                            sub="Busiest today"
                            icon={<BarChart2 className="w-4 h-4 text-blue-500" />}
                            accent="blue"
                        />
                        <MetricCard
                            label="Avg Prep Time"
                            value={avgPrepTimeMinutes !== null ? `${avgPrepTimeMinutes} min` : "—"}
                            sub="Oldest in-kitchen"
                            icon={<Clock className="w-4 h-4 text-violet-500" />}
                            accent="violet"
                        />
                    </div>
                </section>
            )}

            {show("ks-hourly") && (
                <section>
                    <SectionTitle>
                        <BarChart2 className="w-4 h-4 text-blue-500" />
                        Orders Per Hour — Today
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

            {show("ks-pending") && oldestPendingOrder && (
                <section>
                    <SectionTitle>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Longest Pending Order
                    </SectionTitle>
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-lg font-clash-semibold text-amber-800">
                                Order #{oldestPendingOrder.orderNumber}
                            </p>
                            <p className="text-sm text-amber-600 font-satoshi">
                                Waiting <strong>{oldestPendingOrder.waitingMinutes} minutes</strong> · Since{" "}
                                {new Date(oldestPendingOrder.createdAt).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {show("ks-pending") && !oldestPendingOrder && (
                <section>
                    <SectionTitle>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Queue Status
                    </SectionTitle>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
                        <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                        <p className="text-sm font-satoshi-medium text-emerald-700">
                            All clear! No orders currently in the kitchen queue.
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
}
