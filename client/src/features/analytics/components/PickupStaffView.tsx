import { ShoppingBag, CheckCircle, Clock, BarChart2, Package } from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState } from "./AnalyticsShared";
import { HourlyOrdersChart } from "./AnalyticsCharts";
import type { PickupStaffAnalytics } from "../types/analytics.types";

interface Props {
    data: PickupStaffAnalytics;
    visibleIds: string[];
}

export const PICKUP_STAFF_WIDGETS = {
    "ps-summary": "Pickup Summary",
    "ps-ready": "Ready Orders",
    "ps-hourly": "Orders Per Hour",
};

export function PickupStaffView({ data, visibleIds }: Props) {
    const { readyCount, readyOrders, handedOverToday, peakHour, ordersPerHour, avgPickupDelayMinutes } = data;
    const show = (id: string) => visibleIds.includes(id);

    const formatHour = (h: number | null) => h !== null ? `${h}:00 – ${h + 1}:00` : "—";

    return (
        <div className="space-y-6">
            {show("ps-summary") && (
                <section>
                    <SectionTitle>
                        <ShoppingBag className="w-4 h-4 text-orange-500" />
                        Pickup Counter
                    </SectionTitle>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <MetricCard
                            label="Ready for Pickup"
                            value={readyCount}
                            sub="Awaiting collection"
                            icon={<Package className="w-4 h-4 text-orange-500" />}
                            accent="orange"
                        />
                        <MetricCard
                            label="Handed Over Today"
                            value={handedOverToday}
                            sub="Picked up orders"
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
                            label="Avg Pickup Delay"
                            value={avgPickupDelayMinutes !== null ? `${avgPickupDelayMinutes} min` : "—"}
                            sub="From READY to pick"
                            icon={<Clock className="w-4 h-4 text-amber-500" />}
                            accent="amber"
                        />
                    </div>
                </section>
            )}

            {show("ps-ready") && (
                <section>
                    <SectionTitle>
                        <Package className="w-4 h-4 text-orange-500" />
                        Orders Ready for Pickup
                    </SectionTitle>
                    <WidgetCard>
                        {readyOrders.length > 0 ? (
                            <div className="space-y-2">
                                {readyOrders.map((order) => (
                                    <div
                                        key={order._id}
                                        className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-orange-50 border border-orange-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-orange-500 text-white text-xs font-clash-semibold flex items-center justify-center">
                                                #{order.orderNumber}
                                            </span>
                                            <span className="text-sm font-satoshi text-slate-700">
                                                Order #{order.orderNumber}
                                            </span>
                                        </div>
                                        <span className="text-xs text-orange-600 font-satoshi-medium">
                                            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 py-4">
                                <CheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                                <p className="text-sm font-satoshi text-slate-500">
                                    No orders waiting for pickup.
                                </p>
                            </div>
                        )}
                    </WidgetCard>
                </section>
            )}

            {show("ps-hourly") && (
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
        </div>
    );
}
