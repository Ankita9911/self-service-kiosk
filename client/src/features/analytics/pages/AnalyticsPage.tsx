import { useNavigate } from "react-router-dom";
import { RefreshCw, AlertCircle, Zap, ArrowRight } from "lucide-react";
import useAuth from "@/shared/hooks/useAuth";
import { usePermission } from "@/shared/hooks/usePermissions";
import { useAnalytics } from "../hooks/useAnalytics";
import { useAnalyticsLayout } from "../hooks/useAnalyticsLayout";
import { LayoutCustomizer } from "../components/LayoutCustomizer";
import { AnalyticsShimmer } from "../components/AnalyticsShared";
import { DASHBOARD_CARDS } from "../config/Analytic.config";

import { SuperAdminView,     SUPER_ADMIN_WIDGETS     } from "../components/SuperAdminView";
import { FranchiseAdminView, FRANCHISE_ADMIN_WIDGETS } from "../components/FranchiseAdminView";
import { OutletManagerView,  OUTLET_MANAGER_WIDGETS  } from "../components/OutletManagerView";
import { KitchenStaffView,   KITCHEN_STAFF_WIDGETS   } from "../components/KitchenStaffView";
import { PickupStaffView,    PICKUP_STAFF_WIDGETS    } from "../components/PickupStaffView";

import type {
  SuperAdminAnalytics,
  FranchiseAdminAnalytics,
  OutletManagerAnalytics,
  KitchenStaffAnalytics,
  PickupStaffAnalytics,
} from "../types/analytics.types";


function getWidgetsForRole(role: string): Record<string, string> {
  switch (role) {
    case "SUPER_ADMIN":     return SUPER_ADMIN_WIDGETS;
    case "FRANCHISE_ADMIN": return FRANCHISE_ADMIN_WIDGETS;
    case "OUTLET_MANAGER":  return OUTLET_MANAGER_WIDGETS;
    case "KITCHEN_STAFF":   return KITCHEN_STAFF_WIDGETS;
    case "PICKUP_STAFF":    return PICKUP_STAFF_WIDGETS;
    default: return {};
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}



// function RoleStatCard({ role, loading }: { role: string; loading: boolean }) {
//   if (loading) {
//     return (
//       <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/[0.06] p-5">
//         <div className="flex items-start justify-between mb-4">
//           <AnalyticsShimmer className="h-11 w-11 rounded-xl" />
//           <AnalyticsShimmer className="h-4 w-4 rounded" />
//         </div>
//         <AnalyticsShimmer className="h-7 w-28 mb-2" />
//         <AnalyticsShimmer className="h-3.5 w-20" />
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/[0.06] p-5 hover:border-slate-200 dark:hover:border-white/[0.1] transition-colors group">
//       <div className="flex items-start justify-between mb-4">
//         <div className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-white/[0.05] flex items-center justify-center shrink-0">
//           <ShieldCheck className="w-5 h-5 text-slate-400 dark:text-slate-500" />
//         </div>
//         <button className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition opacity-0 group-hover:opacity-100">
//           <MoreHorizontal className="w-4 h-4" />
//         </button>
//       </div>

//       <p className="text-[22px] font-bold text-slate-800 dark:text-white tracking-tight leading-none mb-1.5">
//         {role.replace(/_/g, " ")}
//       </p>

//       <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-none">
//         Your Role
//       </p>

//       <div className="mt-3 pt-3 border-t border-slate-50 dark:border-white/[0.05] flex items-center gap-1.5">
//         <span className="text-[11px] text-slate-400 dark:text-slate-500">Active session</span>
//       </div>
//     </div>
//   );
// }

function QuickCard({
  title, description, icon, badge, onClick, loading,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  onClick: () => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AnalyticsShimmer className="h-10 w-10 rounded-xl" />
          <AnalyticsShimmer className="h-5 w-36" />
        </div>
        <AnalyticsShimmer className="h-3.5 w-full" />
        <AnalyticsShimmer className="h-3.5 w-3/4" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="
        group w-full text-left
        bg-white dark:bg-[#161920]
        border border-slate-100 dark:border-white/6
        hover:border-indigo-200 dark:hover:border-indigo-500/30
        hover:shadow-sm hover:shadow-indigo-50 dark:hover:shadow-indigo-900/10
        rounded-2xl p-6 transition-all duration-200
      "
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="text-[13.5px] font-semibold text-slate-800 dark:text-white leading-none">
              {title}
            </h3>
            {badge && (
              <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors shrink-0">
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        </div>
      </div>
      <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </button>
  );
}

const EMPTY: Record<string, unknown> = {
  SUPER_ADMIN: {
    role: "SUPER_ADMIN",
    summary: {
      totalFranchises: 0, activeFranchises: 0, inactiveFranchises: 0,
      totalOutlets: 0, activeOutlets: 0, inactiveOutlets: 0,
      totalDevices: 0, activeDevices: 0, inactiveDevices: 0,
      totalUsers: 0, usersByRole: {},
    },
    franchiseGrowth: [], outletsByFranchise: [], devicesByOutlet: [],
    recentFranchises: [], recentOutlets: [],
  },
  FRANCHISE_ADMIN: {
    role: "FRANCHISE_ADMIN",
    summary: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalOutlets: 0, totalUsers: 0, cancellationRate: 0 },
    revenueTrend: [], outletBreakdown: [], topItems: [], categoryRevenue: [], statusBreakdown: {},
  },
  OUTLET_MANAGER: {
    role: "OUTLET_MANAGER",
    today: { revenue: 0, orders: 0, avgOrderValue: 0 },
    statusBreakdown: {}, ordersPerHour: [], revenueLast7Days: [],
    topItems: [], categoryRevenue: [], cancellationRate: 0, peakHour: null,
  },
  KITCHEN_STAFF: {
    role: "KITCHEN_STAFF",
    queueCount: 0, completedToday: 0, peakHour: null,
    ordersPerHour: [], oldestPendingOrder: null, avgPrepTimeMinutes: null,
  },
  PICKUP_STAFF: {
    role: "PICKUP_STAFF",
    readyCount: 0, readyOrders: [], handedOverToday: 0,
    peakHour: null, ordersPerHour: [], avgPickupDelayMinutes: null,
  },
};


export default function AnalyticsPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAnalytics();

  const role      = user?.role || "";
  const widgetMap = getWidgetsForRole(role);
  const widgetIds = Object.keys(widgetMap);

  const { layout, orderedVisibleIds, toggleVisibility, moveItem, resetLayout } =
    useAnalyticsLayout(widgetIds);

  const firstName   = user?.name?.split(" ")[0] ?? "there";
  const greeting    = getGreeting();
  const todayLabel  = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const visibleCards = DASHBOARD_CARDS.filter((c) => hasPermission(c.permission));

  const resolvedData = data ?? (EMPTY[role] as unknown ?? null);

  return (
    <div className="space-y-6 max-w-350">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 dark:text-white tracking-tight leading-none">
            {greeting}, <span className="text-indigo-500">{firstName}</span> 👋
          </h1>
          <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1.5">
            {role.replace(/_/g, " ")} · Real-time insights for smarter decisions
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
       
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/6 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300">{todayLabel}</span>
          </div>

     
          <button
            onClick={refetch}
            disabled={loading}
            className="
              flex items-center gap-2 px-3 py-2 rounded-xl
              bg-white dark:bg-[#161920]
              border border-slate-100 dark:border-white/8
              text-[12.5px] font-medium text-slate-500 dark:text-slate-400
              hover:text-slate-700 dark:hover:text-slate-200
              hover:border-slate-200 dark:hover:border-white/15
              disabled:opacity-50 transition
            "
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {visibleCards.length > 0 && (
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Quick Access</span>
            </div>
            <div className={`grid gap-4 ${
              visibleCards.length === 1 ? "grid-cols-1" :
              visibleCards.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}>
              {visibleCards.map((card) => (
                <QuickCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  icon={<card.icon className="w-4 h-4 text-indigo-500" />}
                  badge={card.badge}
                  onClick={() => navigate(card.route)}
                  loading={loading}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {!loading && error && (
        <div className="bg-red-50 dark:bg-red-500/8 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-[13.5px] font-semibold text-red-800 dark:text-red-300">Failed to load analytics</p>
            <p className="text-[12px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="text-[12.5px] font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition shrink-0 underline"
          >
            Try again
          </button>
        </div>
      )}

      {!error && resolvedData && (
        <div className={loading ? "" : "animate-fade-in"}>
          {role === "SUPER_ADMIN" && (
            <SuperAdminView    data={resolvedData as SuperAdminAnalytics}    visibleIds={orderedVisibleIds} loading={loading} />
          )}
          {role === "FRANCHISE_ADMIN" && (
            <FranchiseAdminView data={resolvedData as FranchiseAdminAnalytics} visibleIds={orderedVisibleIds} loading={loading} />
          )}
          {role === "OUTLET_MANAGER" && (
            <OutletManagerView  data={resolvedData as OutletManagerAnalytics}  visibleIds={orderedVisibleIds} loading={loading} />
          )}
          {role === "KITCHEN_STAFF" && (
            <KitchenStaffView   data={resolvedData as KitchenStaffAnalytics}   visibleIds={orderedVisibleIds} loading={loading} />
          )}
          {role === "PICKUP_STAFF" && (
            <PickupStaffView    data={resolvedData as PickupStaffAnalytics}    visibleIds={orderedVisibleIds} loading={loading} />
          )}
        </div>
      )}

    </div>
  );
}