import { Fragment } from "react";
import { ChefHat, Clock, CheckCircle, AlertTriangle, BarChart2 } from "lucide-react";
import { MetricCard, SectionTitle, WidgetCard, EmptyState } from "./AnalyticsShared";
import { HourlyOrdersChart } from "./AnalyticsCharts";
import type { KitchenStaffAnalytics } from "../types/analytics.types";

interface Props {
  data: KitchenStaffAnalytics;
  visibleIds: string[];
  loading?: boolean;
}

export const KITCHEN_STAFF_WIDGETS = {
  "ks-summary": "Kitchen Summary",
  "ks-hourly":  "Orders Per Hour",
  "ks-pending": "Longest Pending Order",
};

export function KitchenStaffView({ data, visibleIds, loading = false }: Props) {
  const { queueCount, completedToday, peakHour, ordersPerHour, oldestPendingOrder, avgPrepTimeMinutes } = data;
  const formatHour = (h: number | null) => h !== null ? `${h}:00 – ${h + 1}:00` : "—";

  const widgetRenderers: Record<string, () => React.ReactNode> = {
    "ks-summary": () => (
      <section>
        <SectionTitle><ChefHat className="w-3.5 h-3.5 text-indigo-500" />Kitchen Dashboard</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard loading={loading} label="In Queue"        value={queueCount}    sub="Orders in kitchen"      icon={<ChefHat     className="w-4 h-4 text-indigo-500"  />} accent="indigo"  />
          <MetricCard loading={loading} label="Completed Today" value={completedToday} sub="Ready / Picked up"     icon={<CheckCircle className="w-4 h-4 text-emerald-500" />} accent="emerald" />
          <MetricCard loading={loading} label="Peak Hour"       value={formatHour(peakHour)} sub="Busiest today"   icon={<BarChart2   className="w-4 h-4 text-blue-500"    />} accent="blue"    />
          <MetricCard loading={loading} label="Avg Prep Time"   value={avgPrepTimeMinutes !== null ? `${avgPrepTimeMinutes} min` : "—"} sub="From creation to ready" icon={<Clock className="w-4 h-4 text-violet-500" />} accent="violet" />
        </div>
      </section>
    ),
    "ks-hourly": () => (
      <section>
        <SectionTitle><BarChart2 className="w-3.5 h-3.5 text-blue-500" />Orders Per Hour — Today</SectionTitle>
        <WidgetCard title="Hourly Volume" subtitle="Order flow across the day" loading={loading} loadingHeight="h-[200px]">
          {ordersPerHour.length > 0
            ? <HourlyOrdersChart data={ordersPerHour} height={200} />
            : <EmptyState message="No orders yet today." />}
        </WidgetCard>
      </section>
    ),
    "ks-pending": () => (
      <section>
        <SectionTitle><AlertTriangle className="w-3.5 h-3.5 text-amber-500" />Queue Status</SectionTitle>
        {oldestPendingOrder ? (
          <div className="bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-amber-800 dark:text-amber-300">Order #{oldestPendingOrder.orderNumber}</p>
              <p className="text-[12.5px] text-amber-600 dark:text-amber-400 mt-0.5">
                Waiting <strong>{oldestPendingOrder.waitingMinutes} minutes</strong> · Since{" "}
                {new Date(oldestPendingOrder.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
            <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
            <p className="text-[13px] font-medium text-emerald-700 dark:text-emerald-400">
              All clear — no orders currently in the kitchen queue.
            </p>
          </div>
        )}
      </section>
    ),
  };

  return (
    <div className="space-y-5">
      {visibleIds.map(id => {
        const renderer = widgetRenderers[id];
        return renderer ? <Fragment key={id}>{renderer()}</Fragment> : null;
      })}
    </div>
  );
}