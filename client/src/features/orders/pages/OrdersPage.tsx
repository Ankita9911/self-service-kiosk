import { useState, useEffect, useMemo } from "react";
import { BarChart2, List, ShieldAlert } from "lucide-react";
import { usePermission } from "@/shared/hooks/usePermissions";
import { PERMISSIONS } from "@/shared/constants/permissions";
import useAuth from "@/shared/hooks/useAuth";
import { getFranchises } from "@/features/franchise/services/franchise.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import type {
  OrderHistoryFilters,
  OrderHistoryItem,
} from "../types/order.types";
import { useOrders } from "../hooks/useOrders";
import { useOrderStats } from "../hooks/useOrderStats";
import { OrdersHeader } from "../components/OrdersHeader";
import { OrdersStats } from "../components/OrdersStats";
import { OrdersFilters } from "../components/OrdersFilters";
import { OrdersTable } from "../components/OrdersTable";
import { OrderDetailModal } from "../components/OrderDetailModal";
import { OrderVisualization } from "../components/OrderVisualization";

const DEFAULT_FILTERS: OrderHistoryFilters = {
  period: "7d",
  date: "",
  status: "ALL",
  paymentMethod: "ALL",
  search: "",
  franchiseId: "",
  outletId: "",
};

type ViewMode = "table" | "charts";

export default function OrdersPage() {
  const { hasPermission } = usePermission();
  const { user } = useAuth();

  const canView = hasPermission(PERMISSIONS.ORDERS_VIEW);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isFranchiseAdmin = user?.role === "FRANCHISE_ADMIN";

  const [filters, setFilters] = useState<OrderHistoryFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(
    null,
  );
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [allOutlets, setAllOutlets] = useState<Outlet[]>([]);

  const {
    orders,
    loading,
    refreshing,
    filterLoading,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
    resetToFirstPage,
    refresh,
  } = useOrders(filters);

  const {
    stats,
    loading: statsLoading,
    refresh: refreshStats,
  } = useOrderStats({
    period: filters.period,
    date: filters.date,
    search: filters.search,
    franchiseId: filters.franchiseId,
    outletId: filters.outletId,
    status: filters.status,
    paymentMethod: filters.paymentMethod,
  });

  useEffect(() => {
    if (!canView) return;
    if (isSuperAdmin) {
      getFranchises()
        .then(setFranchises)
        .catch(() => {});
    }
    getOutlets(isSuperAdmin ? {} : { franchiseId: user?.franchiseId ?? "" })
      .then(setAllOutlets)
      .catch(() => {});
  }, [canView, isSuperAdmin, user?.franchiseId]);

  const visibleOutlets = useMemo(() => {
    if (isSuperAdmin && filters.franchiseId) {
      return allOutlets.filter((o) => o.franchiseId === filters.franchiseId);
    }
    return allOutlets;
  }, [allOutlets, isSuperAdmin, filters.franchiseId]);

  const hasActiveFilters =
    filters.date !== "" ||
    filters.period !== "7d" ||
    filters.status !== "ALL" ||
    filters.paymentMethod !== "ALL" ||
    filters.search !== "" ||
    filters.franchiseId !== "" ||
    filters.outletId !== "";

  const handleFilterChange = (patch: Partial<OrderHistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    resetToFirstPage();
  };

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS);
    resetToFirstPage();
  };

  const handleRefresh = () => {
    refresh(true);
    refreshStats();
  };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <p className="font-medium text-slate-600 dark:text-slate-300">
          Access Restricted
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          You don't have permission to view orders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <OrdersHeader refreshing={refreshing} onRefresh={handleRefresh} />

      <OrdersStats stats={stats} loading={statsLoading} />

      <div className="space-y-3">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              onClick={() => setViewMode("charts")}
              className={`flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-semibold transition-all ${
                viewMode === "charts"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Charts
            </button>
          </div>
        </div>

        <div className="w-full">
          <OrdersFilters
            filters={filters}
            isSuperAdmin={isSuperAdmin}
            isFranchiseAdmin={isFranchiseAdmin}
            franchises={franchises}
            outlets={visibleOutlets}
            hasActiveFilters={hasActiveFilters}
            onFilterChange={handleFilterChange}
            onClear={handleClear}
          />
        </div>
      </div>

      {viewMode === "table" ? (
        <OrdersTable
          orders={orders}
          loading={loading}
          filterLoading={filterLoading}
          totalMatching={totalMatching}
          page={page}
          pageSize={pageSize}
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
          onPrevPage={goToPrevPage}
          onNextPage={goToNextPage}
          onPageSizeChange={setPageSize}
          onViewOrder={setSelectedOrder}
        />
      ) : (
        <OrderVisualization stats={stats} loading={statsLoading} />
      )}

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
