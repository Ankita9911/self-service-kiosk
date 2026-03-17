import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Shimmer } from "@/shared/components/ui/ShimmerCell";
import type { OrderStats } from "../types/order.types";

const PAYMENT_COLORS: Record<string, string> = {
  CASH: "#10b981",
  CARD: "#6366f1",
  UPI:  "#8b5cf6",
};

const STATUS_COLORS: Record<string, string> = {
  CREATED:    "#f59e0b",
  IN_KITCHEN: "#6366f1",
  READY:      "#10b981",
  PICKED_UP:  "#94a3b8",
  COMPLETED:  "#64748b",
};

function ChartCard({ title, children, loading }: { title: string; children: React.ReactNode; loading: boolean }) {
  return (
    <div className="bg-white dark:bg-[#1e2130] rounded-2xl border border-slate-100 dark:border-white/6 p-5">
      {loading ? (
        <div className="space-y-3">
          <Shimmer w="w-36" h="h-5" />
          <Shimmer w="w-full" h="h-44" rounded="rounded-xl" />
        </div>
      ) : (
        <>
          <h3 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>
          {children}
        </>
      )}
    </div>
  );
}

function formatHourLabel(h: number): string {
  const p = h >= 12 ? "PM" : "AM";
  const d = h % 12 === 0 ? 12 : h % 12;
  return `${d}${p}`;
}

function formatCurrency(v: number): string {
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v}`;
}

interface OrderVisualizationProps {
  stats: OrderStats | null;
  loading: boolean;
}

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316", "#84cc16"];

export function OrderVisualization({ stats, loading }: OrderVisualizationProps) {
  // ordersPerHour._id is always a number (0–23) in local time
  const hourlyData = (stats?.ordersPerHour ?? []).map((h) => ({
    hour: formatHourLabel(h._id as number),
    orders: h.count,
    revenue: h.revenue,
  }));

  const trendData = (stats?.trend ?? []).map((t) => ({
    date: t._id,
    orders: t.count,
    revenue: t.revenue,
  }));

  const paymentData = Object.entries(stats?.paymentBreakdown ?? {}).map(([key, val]) => ({
    name: key,
    value: val.count,
    revenue: val.revenue,
    fill: PAYMENT_COLORS[key] ?? "#94a3b8",
  }));

  const statusData = Object.entries(stats?.statusBreakdown ?? {}).map(([key, val]) => ({
    name: key.replace("_", " "),
    count: val.count,
    revenue: val.revenue,
    fill: STATUS_COLORS[key] ?? "#94a3b8",
  }));

  const topItems = stats?.topItems ?? [];
  const topCategories = stats?.topCategories ?? [];
  const outletBreakdown = stats?.outletBreakdown ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Orders per Hour (Peak Analysis)" loading={loading}>
          {hourlyData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-[12px] text-slate-400">No hourly data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hourlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [v, "Orders"]}
                />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title={stats?.isDateSpecific ? "Hourly Order Breakdown" : "Daily Order Trend"} loading={loading}>
          {trendData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-[12px] text-slate-400">No trend data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number, name: string) => [
                    name === "revenue" ? formatCurrency(v) : v,
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                />
                <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Payment Method Split" loading={loading}>
          {paymentData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-[12px] text-slate-400">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={paymentData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                  {paymentData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number, name: string, props) => [
                    `${v} orders — ${formatCurrency(props.payload.revenue)}`,
                    props.payload.name,
                  ]}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Order Status Breakdown" loading={loading}>
          {statusData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-[12px] text-slate-400">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} layout="vertical" margin={{ top: 4, right: 12, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} width={70} />
                <Tooltip
                  contentStyle={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [v, "Orders"]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {topItems.length > 0 && (
        <ChartCard title="Top Selling Items" loading={loading}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topItems.slice(0, 8)} margin={{ top: 4, right: 4, left: -20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number, name: string) => [
                  name === "totalRevenue" ? formatCurrency(v) : v,
                  name === "totalRevenue" ? "Revenue" : "Sold",
                ]}
              />
              <Bar dataKey="totalSold" fill="#6366f1" radius={[4, 4, 0, 0]} name="totalSold" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {topCategories.length > 0 && (
        <ChartCard title="Revenue by Category" loading={loading}>
          <div className="space-y-2.5">
            {(() => {
              const maxRev = Math.max(...topCategories.map((c) => c.totalRevenue), 1);
              return topCategories.map((cat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[12px] text-slate-600 dark:text-slate-400 w-32 shrink-0 truncate">{cat.categoryName}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/6 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(cat.totalRevenue / maxRev) * 100}%`,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 w-16 text-right font-mono">
                    {formatCurrency(cat.totalRevenue)}
                  </span>
                </div>
              ));
            })()}
          </div>
        </ChartCard>
      )}

      {outletBreakdown.length > 0 && (
        <ChartCard title="Outlet Performance" loading={loading}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={outletBreakdown} margin={{ top: 4, right: 4, left: -10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                contentStyle={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number, name: string) => [
                  name === "totalRevenue" ? formatCurrency(v) : v,
                  name === "totalRevenue" ? "Revenue" : "Orders",
                ]}
              />
              <Bar dataKey="totalRevenue" fill="#10b981" radius={[4, 4, 0, 0]} name="totalRevenue" />
              <Bar dataKey="totalOrders" fill="#6366f1" radius={[4, 4, 0, 0]} name="totalOrders" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
