import { RefreshCw, BarChart2, AlertCircle } from "lucide-react";
import useAuth from "@/shared/hooks/useAuth";
import { useAnalytics } from "../hooks/useAnalytics";
import { useAnalyticsLayout } from "../hooks/useAnalyticsLayout";
import { LayoutCustomizer } from "../components/LayoutCustomizer";
import { AnalyticsShimmer } from "../components/AnalyticsShared";

import {
    SuperAdminView,
    SUPER_ADMIN_WIDGETS,
} from "../components/SuperAdminView";
import {
    FranchiseAdminView,
    FRANCHISE_ADMIN_WIDGETS,
} from "../components/FranchiseAdminView";
import {
    OutletManagerView,
    OUTLET_MANAGER_WIDGETS,
} from "../components/OutletManagerView";
import {
    KitchenStaffView,
    KITCHEN_STAFF_WIDGETS,
} from "../components/KitchenStaffView";
import {
    PickupStaffView,
    PICKUP_STAFF_WIDGETS,
} from "../components/PickupStaffView";

import type {
    SuperAdminAnalytics,
    FranchiseAdminAnalytics,
    OutletManagerAnalytics,
    KitchenStaffAnalytics,
    PickupStaffAnalytics,
} from "../types/analytics.types";

function getWidgetsForRole(role: string): Record<string, string> {
    switch (role) {
        case "SUPER_ADMIN":
            return SUPER_ADMIN_WIDGETS;
        case "FRANCHISE_ADMIN":
            return FRANCHISE_ADMIN_WIDGETS;
        case "OUTLET_MANAGER":
            return OUTLET_MANAGER_WIDGETS;
        case "KITCHEN_STAFF":
            return KITCHEN_STAFF_WIDGETS;
        case "PICKUP_STAFF":
            return PICKUP_STAFF_WIDGETS;
        default:
            return {};
    }
}

export default function AnalyticsPage() {
    const { user } = useAuth();
    const { data, loading, error, refetch } = useAnalytics();

    const role = user?.role || "";
    const widgetMap = getWidgetsForRole(role);
    const widgetIds = Object.keys(widgetMap);

    const { layout, orderedVisibleIds, toggleVisibility, moveItem, resetLayout } =
        useAnalyticsLayout(widgetIds);

    const roleLabel = role.replace(/_/g, " ");

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart2 className="w-5 h-5 text-orange-500" />
                        <h1 className="text-2xl font-clash-semibold text-slate-800">
                            Analytics
                        </h1>
                    </div>
                    <p className="text-sm text-slate-400 font-satoshi">
                        {roleLabel} · Real-time insights for smarter decisions
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Last refreshed */}
                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="flex items-center gap-2 text-sm font-satoshi-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:shadow-sm transition-all disabled:opacity-50"
                        title="Refresh data"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                        />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    {/* Layout customizer */}
                    {widgetIds.length > 0 && (
                        <LayoutCustomizer
                            layout={layout}
                            widgetLabels={widgetMap}
                            onToggle={toggleVisibility}
                            onMove={moveItem}
                            onReset={resetLayout}
                        />
                    )}
                </div>
            </div>

            {loading && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <AnalyticsShimmer key={i} className="h-28" />
                        ))}
                    </div>
                    <AnalyticsShimmer className="h-64 w-full" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <AnalyticsShimmer className="h-60" />
                        <AnalyticsShimmer className="h-60" />
                    </div>
                </div>
            )}

            {!loading && error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-satoshi-medium text-rose-800">
                            Failed to load analytics
                        </p>
                        <p className="text-xs text-rose-500 mt-0.5">{error}</p>
                    </div>
                    <button
                        onClick={refetch}
                        className="ml-auto text-xs font-satoshi-medium text-rose-600 hover:text-rose-800 underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && data && (
                <div className="animate-fade-in">
                    {data.role === "SUPER_ADMIN" && (
                        <SuperAdminView
                            data={data as SuperAdminAnalytics}
                            visibleIds={orderedVisibleIds}
                        />
                    )}
                    {data.role === "FRANCHISE_ADMIN" && (
                        <FranchiseAdminView
                            data={data as FranchiseAdminAnalytics}
                            visibleIds={orderedVisibleIds}
                        />
                    )}
                    {data.role === "OUTLET_MANAGER" && (
                        <OutletManagerView
                            data={data as OutletManagerAnalytics}
                            visibleIds={orderedVisibleIds}
                        />
                    )}
                    {data.role === "KITCHEN_STAFF" && (
                        <KitchenStaffView
                            data={data as KitchenStaffAnalytics}
                            visibleIds={orderedVisibleIds}
                        />
                    )}
                    {data.role === "PICKUP_STAFF" && (
                        <PickupStaffView
                            data={data as PickupStaffAnalytics}
                            visibleIds={orderedVisibleIds}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
