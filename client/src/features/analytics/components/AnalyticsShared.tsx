import { MoreHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export function AnalyticsShimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-100 dark:bg-white/6 rounded-lg ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
    </div>
  );
}

type Accent =
  | "indigo"
  | "emerald"
  | "blue"
  | "violet"
  | "rose"
  | "amber"
  | "slate";

const ACCENT_MAP: Record<
  Accent,
  { iconBg: string; trendPos: string; trendNeg: string }
> = {
  indigo: {
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    trendPos: "text-emerald-500 dark:text-emerald-400",
    trendNeg: "text-red-500 dark:text-red-400",
  },
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    trendPos: "text-emerald-500 dark:text-emerald-400",
    trendNeg: "text-red-500 dark:text-red-400",
  },
  blue: {
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    trendPos: "text-emerald-500 dark:text-emerald-400",
    trendNeg: "text-red-500 dark:text-red-400",
  },
  violet: {
    iconBg: "bg-violet-50 dark:bg-violet-500/10",
    trendPos: "text-emerald-500 dark:text-emerald-400",
    trendNeg: "text-red-500 dark:text-red-400",
  },
  rose: {
    iconBg: "bg-rose-50 dark:bg-rose-500/10",
    trendPos: "text-emerald-500 dark:text-emerald-400",
    trendNeg: "text-red-500 dark:text-red-400",
  },
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    trendPos: "text-emerald-500 dark:text-emerald-400",
    trendNeg: "text-red-500 dark:text-red-400",
  },
  slate: {
    iconBg: "bg-slate-50 dark:bg-white/[0.05]",
    trendPos: "text-emerald-500 dark:text-emerald-400",
    trendNeg: "text-red-500 dark:text-red-400",
  },
};

function normalizeAccent(accent: string): Accent {
  const map: Record<string, Accent> = {
    orange: "indigo", // remap legacy orange → indigo
    indigo: "indigo",
    emerald: "emerald",
    blue: "blue",
    violet: "violet",
    rose: "rose",
    amber: "amber",
    slate: "slate",
  };
  return map[accent] ?? "indigo";
}

export function MetricCard({
  label,
  value,
  sub,
  icon,
  accent = "indigo",
  trend,
  loading = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  trend?: { value: number; label?: string };
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 p-5">
        <div className="flex items-start justify-between mb-4">
          <AnalyticsShimmer className="h-10 w-10 rounded-xl" />
          <AnalyticsShimmer className="h-4 w-4 rounded" />
        </div>
        <AnalyticsShimmer className="h-6 w-28 mb-2" />
        <AnalyticsShimmer className="h-3.5 w-20" />
        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-white/5">
          <AnalyticsShimmer className="h-3 w-24" />
        </div>
      </div>
    );
  }

  const a = ACCENT_MAP[normalizeAccent(accent)];
  const isPositive = (trend?.value ?? 0) >= 0;

  return (
    <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 p-5 hover:border-slate-200 dark:hover:border-white/10 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`h-10 w-10 rounded-xl ${a.iconBg} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
        <button className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[21px] font-bold text-slate-800 dark:text-white tracking-tight leading-none mb-1.5">
        {value}
      </p>
      <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-none">
        {label}
      </p>
      {(sub || trend !== undefined) && (
        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-white/5 flex items-center gap-1.5 flex-wrap">
          {sub && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {sub}
            </span>
          )}
          {trend !== undefined && (
            <span
              className={`text-[11px] font-semibold ml-auto ${isPositive ? a.trendPos : a.trendNeg}`}
            >
              {isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              {trend.label ? ` ${trend.label}` : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function WidgetCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  noPad = false,
  loading = false,
  loadingHeight = "h-[220px]",
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPad?: boolean;
  loading?: boolean;
  loadingHeight?: string;
}) {
  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 overflow-hidden ${className}`}
      >
        {title && (
          <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-50 dark:border-white/5">
            <div className="space-y-1.5 flex-1">
              <AnalyticsShimmer className="h-4 w-36" />
              {subtitle && <AnalyticsShimmer className="h-3 w-52" />}
            </div>
          </div>
        )}
        <div className="p-5">
          <AnalyticsShimmer className={`w-full ${loadingHeight}`} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 overflow-hidden ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-white/5">
          <div>
            <p className="text-[13.5px] font-semibold text-slate-800 dark:text-white">
              {title}
            </p>
            {subtitle && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPad ? "" : "p-5"}>{children}</div>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        {children}
      </h2>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/4 flex items-center justify-center">
        <MoreHorizontal className="w-4 h-4 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-[12.5px] text-slate-400 dark:text-slate-500 text-center">
        {message}
      </p>
    </div>
  );
}

export function TopItemsList({
  items,
  loading = false,
  count = 5,
}: {
  items: Array<{
    _id: unknown;
    name: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  loading?: boolean;
  count?: number;
}) {
  const rankColors = [
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    "bg-slate-100 text-slate-600 dark:bg-white/[0.07] dark:text-slate-400",
    "bg-slate-100 text-slate-600 dark:bg-white/[0.07] dark:text-slate-400",
  ];

  if (loading) {
    return (
      <div className="divide-y divide-slate-50 dark:divide-white/4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 px-5">
            <AnalyticsShimmer className="h-6 w-6 rounded-full shrink-0" />
            <AnalyticsShimmer className="h-3.5 flex-1" />
            <AnalyticsShimmer className="h-3 w-12 shrink-0" />
            <AnalyticsShimmer className="h-3.5 w-16 shrink-0 ml-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50 dark:divide-white/4">
      {items.map((item, i) => (
        <div
          key={String(item._id)}
          className="flex items-center gap-3 py-2.5 px-5 hover:bg-slate-50/50 dark:hover:bg-white/2 transition"
        >
          <span
            className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${rankColors[i] ?? rankColors[4]}`}
          >
            {i + 1}
          </span>
          <span className="flex-1 text-[12.5px] text-slate-700 dark:text-slate-300 truncate">
            {item.name}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
            {item.totalSold} sold
          </span>
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 shrink-0 ml-2">
            ₹{item.totalRevenue.toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function OutletProgressList({
  outlets,
  loading = false,
  count = 4,
}: {
  outlets: Array<{
    outletId: unknown;
    name?: string;
    outletCode: string;
    revenue: number;
    orders: number;
    contributionPercent: number;
  }>;
  loading?: boolean;
  count?: number;
}) {
  if (loading) {
    return (
      <div className="space-y-4 p-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <AnalyticsShimmer className="h-3.5 w-28" />
              <AnalyticsShimmer className="h-3.5 w-24" />
            </div>
            <AnalyticsShimmer className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5">
      {outlets.map((o) => (
        <div key={String(o.outletId)}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12.5px] font-medium text-slate-700 dark:text-slate-300 truncate flex-1">
              {o.name || o.outletCode}
            </span>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {o.orders} orders
              </span>
              <span className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200">
                ₹{o.revenue.toLocaleString("en-IN")}
              </span>
              <span className="text-[10.5px] font-semibold text-indigo-500 dark:text-indigo-400 w-9 text-right">
                {o.contributionPercent}%
              </span>
            </div>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-white/6 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(o.contributionPercent, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const STATUS_BADGE_MAP: Record<string, string> = {
  CREATED:
    "bg-slate-100 text-slate-500 dark:bg-white/[0.07] dark:text-slate-400",
  IN_KITCHEN:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  READY: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  COMPLETED:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  PICKED_UP:
    "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
};

export function PeriodSelector({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-auto min-w-30 text-[12px] font-medium border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 shadow-none focus:ring-1 focus:ring-indigo-400 rounded-lg px-3">
        <SelectValue>{current?.label ?? value}</SelectValue>
      </SelectTrigger>
      <SelectContent className="text-[12px]">
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="text-[12px] font-medium"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE_MAP[status] ?? STATUS_BADGE_MAP.CREATED}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function OutletLeaderboard({
  outlets,
  loading = false,
  count = 5,
}: {
  outlets: Array<{
    outletId: unknown;
    name?: string;
    outletCode: string;
    revenue: number;
    orders: number;
    contributionPercent: number;
  }>;
  loading?: boolean;
  count?: number;
}) {
  const rankColors = [
    "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    "bg-slate-100 text-slate-500 dark:bg-white/[0.07] dark:text-slate-400",
    "bg-slate-100 text-slate-500 dark:bg-white/[0.07] dark:text-slate-400",
    "bg-slate-100 text-slate-500 dark:bg-white/[0.07] dark:text-slate-400",
    "bg-slate-100 text-slate-500 dark:bg-white/[0.07] dark:text-slate-400",
  ];

  if (loading) {
    return (
      <div className="divide-y divide-slate-50 dark:divide-white/4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <AnalyticsShimmer className="h-6 w-6 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <AnalyticsShimmer className="h-3.5 w-32" />
              <AnalyticsShimmer className="h-1.5 w-full rounded-full" />
            </div>
            <AnalyticsShimmer className="h-3.5 w-20 shrink-0" />
            <AnalyticsShimmer className="h-3.5 w-10 shrink-0" />
            <AnalyticsShimmer className="h-3.5 w-8 shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-2 border-b border-slate-50 dark:border-white/4">
        <span className="w-6 shrink-0" />
        <span className="flex-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          Outlet
        </span>
        <span className="w-24 shrink-0 text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-right">
          Revenue
        </span>
        <span className="w-16 shrink-0 text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-right">
          Orders
        </span>
        <span className="w-8 shrink-0 text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-right">
          Share
        </span>
      </div>
      {/* Data rows */}
      <div className="divide-y divide-slate-50 dark:divide-white/4">
        {outlets.map((o, i) => (
          <div
            key={String(o.outletId)}
            className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-white/2 transition"
          >
            <span
              className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${rankColors[i] ?? rankColors[4]}`}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-slate-700 dark:text-slate-300 truncate">
                {o.name || o.outletCode}
              </p>
              <div className="mt-1.5 h-1 bg-slate-100 dark:bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(o.contributionPercent, 100)}%` }}
                />
              </div>
            </div>
            <span className="w-24 shrink-0 text-[12.5px] font-semibold text-slate-700 dark:text-slate-200 text-right">
              ₹{o.revenue.toLocaleString("en-IN")}
            </span>
            <span className="w-16 shrink-0 text-[11.5px] text-slate-400 dark:text-slate-500 text-right">
              {o.orders} orders
            </span>
            <span className="w-8 shrink-0 text-[11.5px] font-bold text-indigo-500 dark:text-indigo-400 text-right">
              {o.contributionPercent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
