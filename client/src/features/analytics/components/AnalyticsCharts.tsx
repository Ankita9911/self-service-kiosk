import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import type { TrendPoint, HourPoint, CategoryRevenue } from "../types/analytics.types";

// ─── Palette ───────────────────────────────────────────────────────────────
const PALETTE = [
    "#f97316", // orange-500
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#8b5cf6", // violet-500
    "#f43f5e", // rose-500
    "#f59e0b", // amber-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
];

function formatCurrency(val: number) {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
}

function formatDate(d: string) {
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

// ─── Revenue/Orders Area Chart ─────────────────────────────────────────────
export function RevenueTrendChart({
    data,
    dataKey = "revenue",
    color = "#f97316",
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

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={formatted} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                />
                <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                    tickFormatter={
                        dataKey === "revenue"
                            ? formatCurrency
                            : (v: number) => v.toString()
                    }
                />
                <Tooltip
                    contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                    }}
                    formatter={(value, name) => {
                        const safeValue = value ?? 0;

                        return dataKey === "revenue"
                            ? [`₹${Number(safeValue).toLocaleString("en-IN")}`, "Revenue"]
                            : [safeValue, "Orders"];
                    }}
                    labelStyle={{ color: "#64748b", fontWeight: 600 }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2.5}
                    fill={`url(#grad-${color.replace("#", "")})`}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// ─── Orders Per Hour Bar Chart ─────────────────────────────────────────────
export function HourlyOrdersChart({ data, height = 200 }: { data: HourPoint[]; height?: number }) {
    const filled = Array.from({ length: 24 }, (_, i) => {
        const found = data.find((d) => d._id === i);
        return { hour: `${i}:00`, count: found?.count || 0 };
    });

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={filled} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    interval={3}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                />
                <Tooltip
                    contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                    }}
                    formatter={(value) => [value ?? 0, "Orders"]}
                />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ─── Category Pie Chart ────────────────────────────────────────────────────
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
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                >
                    {formatted.map((_, index) => (
                        <Cell
                            key={index}
                            fill={PALETTE[index % PALETTE.length]}
                            stroke="none"
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                    }}
                    formatter={(value) => [
                        `₹${Number(value ?? 0).toLocaleString("en-IN")}`,
                        "Revenue",
                    ]}
                />
                <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => (
                        <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

// ─── Outlet Bar Chart ──────────────────────────────────────────────────────
export function OutletRevenueChart({
    data,
    height = 220,
}: {
    data: Array<{ name: string; revenue: number; orders: number }>;
    height?: number;
}) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCurrency}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                />
                <Tooltip
                    contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                    }}
                    formatter={(value) =>
                        [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, "Revenue"]
                    }
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={18} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ─── Status Donut ──────────────────────────────────────────────────────────
export function StatusDonutChart({ breakdown }: { breakdown: Record<string, number> }) {
    const STATUS_COLORS: Record<string, string> = {
        CREATED: "#94a3b8",
        IN_KITCHEN: "#f59e0b",
        READY: "#3b82f6",
        COMPLETED: "#10b981",
        PICKED_UP: "#8b5cf6",
    };

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
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                    }}
                    formatter={(value, _name, props) => [
                        value ?? 0,
                        props?.payload?.name ?? "",
                    ]}
                />
                <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => (
                        <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
