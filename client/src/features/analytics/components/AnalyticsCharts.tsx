import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import type { TrendPoint, HourPoint, CategoryRevenue } from "../types/analytics.types";

export const PALETTE = [
  "#6366f1", 
  "#8b5cf6", 
  "#3b82f6", 
  "#10b981", 
  "#f59e0b", 
  "#f43f5e", 
  "#06b6d4", 
  "#84cc16", 
];

const GRID_COLOR   = "#f1f5f9"; 
const AXIS_COLOR   = "#94a3b8";
const TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  fontSize: "12px",
  fontFamily: "Geist, sans-serif",
};


function formatCurrency(val: number) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000)   return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}


export function RevenueTrendChart({
  data,
  dataKey = "revenue",
  color = "#6366f1",
  height = 220,
}: {
  data: TrendPoint[];
  dataKey?: "revenue" | "orders" | "count";
  color?: string;
  height?: number;
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatDate(d._id),
    value: d[dataKey] ?? 0,
  }));

  const gradId = `grad-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: AXIS_COLOR, fontFamily: "Geist, sans-serif" }}
          axisLine={false} tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: AXIS_COLOR, fontFamily: "Geist, sans-serif" }}
          axisLine={false} tickLine={false} width={52}
          tickFormatter={dataKey === "revenue" ? formatCurrency : (v: number) => String(v)}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => {
            const v = value ?? 0;
            return dataKey === "revenue"
              ? [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]
              : [v, "Orders"];
          }}
          labelStyle={{ color: "#64748b", fontWeight: 600, marginBottom: 4 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}


export function HourlyOrdersChart({ data, height = 200 }: { data: HourPoint[]; height?: number }) {
  const filled = Array.from({ length: 24 }, (_, i) => {
    const found = data.find((d) => d._id === i);
    return { hour: `${i}h`, count: found?.count || 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={filled} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 10, fill: AXIS_COLOR, fontFamily: "Geist, sans-serif" }}
          axisLine={false} tickLine={false} interval={3}
        />
        <YAxis
          tick={{ fontSize: 10, fill: AXIS_COLOR, fontFamily: "Geist, sans-serif" }}
          axisLine={false} tickLine={false} width={28}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [value ?? 0, "Orders"]}
          labelStyle={{ color: "#64748b", fontWeight: 600 }}
        />
        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}


export function CategoryPieChart({ data }: { data: CategoryRevenue[] }) {
  const formatted = data.map((d) => ({
    name: d.categoryName || "Unknown",
    value: d.revenue,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={formatted}
          cx="50%" cy="50%"
          innerRadius={58} outerRadius={88}
          paddingAngle={3}
          dataKey="value"
        >
          {formatted.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
        />
        <Legend
          iconType="circle" iconSize={7}
          formatter={(v) => <span style={{ fontSize: 11, color: "#64748b", fontFamily: "Geist, sans-serif" }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}


export function OutletRevenueChart({
  data,
  height = 220,
}: {
  data: Array<{ name: string; revenue: number; orders: number }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: AXIS_COLOR, fontFamily: "Geist, sans-serif" }}
          axisLine={false} tickLine={false}
          tickFormatter={formatCurrency}
        />
        <YAxis
          type="category" dataKey="name"
          tick={{ fontSize: 10, fill: "#64748b", fontFamily: "Geist, sans-serif" }}
          axisLine={false} tickLine={false} width={82}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
        />
        <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const STATUS_COLORS: Record<string, string> = {
  CREATED:    "#94a3b8",
  IN_KITCHEN: "#f59e0b",
  READY:      "#6366f1",
  COMPLETED:  "#10b981",
  PICKED_UP:  "#8b5cf6",
};

export function StatusDonutChart({ breakdown }: { breakdown: Record<string, number> }) {
  const data = Object.entries(breakdown).map(([status, count]) => ({
    name: status.replace(/_/g, " "),
    value: count,
    color: STATUS_COLORS[status] || "#cbd5e1",
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={52} outerRadius={78}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value, _name, props) => [value ?? 0, props?.payload?.name ?? ""]}
        />
        <Legend
          iconType="circle" iconSize={7}
          formatter={(v) => <span style={{ fontSize: 11, color: "#64748b", fontFamily: "Geist, sans-serif" }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}