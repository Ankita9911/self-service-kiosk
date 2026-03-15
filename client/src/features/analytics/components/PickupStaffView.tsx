import { Fragment } from "react";
import {
  ShoppingBag,
  CheckCircle,
  Clock,
  BarChart2,
  Package,
} from "lucide-react";
import {
  MetricCard,
  SectionTitle,
  WidgetCard,
  EmptyState,
} from "./AnalyticsShared";
import { HourlyOrdersChart } from "./AnalyticsCharts";
import type { PickupStaffAnalytics } from "../types/analytics.types";

interface Props {
  data: PickupStaffAnalytics;
  visibleIds: string[];
  loading?: boolean;
}

export const PICKUP_STAFF_WIDGETS = {
  "ps-summary": "Pickup Summary",
  "ps-ready": "Ready Orders",
  "ps-hourly": "Orders Per Hour",
};

export function PickupStaffView({ data, visibleIds, loading = false }: Props) {
  const {
    readyCount,
    readyOrders,
    handedOverToday,
    peakHour,
    ordersPerHour,
    avgPickupDelayMinutes,
  } = data;
  const formatHour = (h: number | null) =>
    h !== null ? `${h}:00 – ${h + 1}:00` : "—";

  const widgetRenderers: Record<string, () => React.ReactNode> = {
    "ps-summary": () => (
      <section>
        <SectionTitle>
          <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
          Pickup Counter
        </SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            loading={loading}
            label="Ready for Pickup"
            value={readyCount}
            sub="Awaiting collection"
            icon={<Package className="w-4 h-4 text-indigo-500" />}
            accent="indigo"
          />
          <MetricCard
            loading={loading}
            label="Handed Over Today"
            value={handedOverToday}
            sub="Picked up orders"
            icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
            accent="emerald"
          />
          <MetricCard
            loading={loading}
            label="Peak Hour"
            value={formatHour(peakHour)}
            sub="Busiest today"
            icon={<BarChart2 className="w-4 h-4 text-blue-500" />}
            accent="blue"
          />
          <MetricCard
            loading={loading}
            label="Avg Pickup Delay"
            value={
              avgPickupDelayMinutes !== null
                ? `${avgPickupDelayMinutes} min`
                : "—"
            }
            sub="From READY to pickup"
            icon={<Clock className="w-4 h-4 text-amber-500" />}
            accent="amber"
          />
        </div>
      </section>
    ),
    "ps-ready": () => (
      <section>
        <SectionTitle>
          <Package className="w-3.5 h-3.5 text-indigo-500" />
          Orders Ready for Pickup
        </SectionTitle>
        <WidgetCard
          title="Ready Queue"
          subtitle="Awaiting customer collection"
          loading={loading}
          loadingHeight="h-[160px]"
        >
          {readyOrders.length > 0 ? (
            <div className="space-y-2">
              {readyOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/8 border border-indigo-100 dark:border-indigo-500/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">
                      Order #{order.orderNumber}
                    </span>
                  </div>
                  <span className="text-[11.5px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 py-4">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                No orders waiting for pickup.
              </p>
            </div>
          )}
        </WidgetCard>
      </section>
    ),
    "ps-hourly": () => (
      <section>
        <SectionTitle>
          <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
          Orders Per Hour — Today
        </SectionTitle>
        <WidgetCard
          title="Hourly Volume"
          subtitle="Order flow across the day"
          loading={loading}
          loadingHeight="h-[200px]"
        >
          {ordersPerHour.length > 0 ? (
            <HourlyOrdersChart data={ordersPerHour} height={200} />
          ) : (
            <EmptyState message="No orders yet today." />
          )}
        </WidgetCard>
      </section>
    ),
  };

  return (
    <div className="space-y-5">
      {visibleIds.map((id) => {
        const renderer = widgetRenderers[id];
        return renderer ? <Fragment key={id}>{renderer()}</Fragment> : null;
      })}
    </div>
  );
}
