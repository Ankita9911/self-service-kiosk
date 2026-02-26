interface Props {
    className?: string;
}

export function AnalyticsShimmer({ className = "" }: Props) {
    return (
        <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />
    );
}

export function MetricCard({
    label,
    value,
    sub,
    icon,
    accent = "orange",
    trend,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    accent?: "orange" | "emerald" | "blue" | "violet" | "rose" | "amber";
    trend?: { value: number; label?: string };
}) {
    const accentMap = {
        orange: {
            ring: "ring-orange-100",
            bg: "bg-orange-50",
            text: "text-orange-600",
            trendPos: "text-emerald-500",
            trendNeg: "text-rose-500",
        },
        emerald: {
            ring: "ring-emerald-100",
            bg: "bg-emerald-50",
            text: "text-emerald-600",
            trendPos: "text-emerald-500",
            trendNeg: "text-rose-500",
        },
        blue: {
            ring: "ring-blue-100",
            bg: "bg-blue-50",
            text: "text-blue-600",
            trendPos: "text-emerald-500",
            trendNeg: "text-rose-500",
        },
        violet: {
            ring: "ring-violet-100",
            bg: "bg-violet-50",
            text: "text-violet-600",
            trendPos: "text-emerald-500",
            trendNeg: "text-rose-500",
        },
        rose: {
            ring: "ring-rose-100",
            bg: "bg-rose-50",
            text: "text-rose-600",
            trendPos: "text-emerald-500",
            trendNeg: "text-rose-500",
        },
        amber: {
            ring: "ring-amber-100",
            bg: "bg-amber-50",
            text: "text-amber-600",
            trendPos: "text-emerald-500",
            trendNeg: "text-rose-500",
        },
    };

    const a = accentMap[accent];
    const isPositive = (trend?.value ?? 0) >= 0;

    return (
        <div
            className={`bg-white rounded-2xl border p-5 ring-1 ${a.ring} hover:shadow-md transition-shadow duration-200`}
        >
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-satoshi-medium">
                    {label}
                </span>
                <div
                    className={`h-8 w-8 rounded-xl ${a.bg} flex items-center justify-center`}
                >
                    {icon}
                </div>
            </div>

            <p className={`text-2xl font-clash-semibold ${a.text}`}>{value}</p>

            <div className="mt-2 flex items-center gap-2">
                {sub && (
                    <p className="text-xs text-slate-400 font-satoshi">{sub}</p>
                )}
                {trend !== undefined && (
                    <span
                        className={`text-xs font-satoshi-medium ml-auto ${isPositive ? a.trendPos : a.trendNeg}`}
                    >
                        {isPositive ? "▲" : "▼"} {Math.abs(trend.value)}%
                        {trend.label ? ` ${trend.label}` : ""}
                    </span>
                )}
            </div>
        </div>
    );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-lg font-clash-semibold text-slate-800 mb-4 flex items-center gap-2">
            {children}
        </h2>
    );
}

export function WidgetCard({
    title,
    children,
    className = "",
}: {
    title?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${className}`}
        >
            {title && (
                <p className="text-sm font-satoshi-medium text-slate-500 mb-4">
                    {title}
                </p>
            )}
            {children}
        </div>
    );
}

export function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-10 text-slate-400 text-sm font-satoshi">
            {message}
        </div>
    );
}
