import { useEffect, useState } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { useIngredients } from "@/features/ingredients/hooks/useIngredients";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import { IngredientStats } from "@/features/ingredients/components/IngredientStats";
import { IngredientFilters } from "@/features/ingredients/components/IngredientFilters";
import { IngredientHeader } from "@/features/ingredients/components/IngredientHeader";
import { IngredientStockBadge } from "@/features/ingredients/components/IngredientStockBadge";
import {
  IngredientFormModal,
  UNITS,
} from "@/features/ingredients/components/IngredientFormModal";
import { IngredientRowMenu } from "@/features/ingredients/components/IngredientRowMenu";
import { StockAdjustModal } from "@/features/ingredients/components/StockAdjustModal";
import { CursorPagination } from "@/shared/components/ui/CursorPagination";
import { Shimmer } from "@/shared/components/ui/ShimmerCell";
import type { Ingredient } from "@/features/ingredients/types/ingredient.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import { Package, ShieldAlert } from "lucide-react";

const UNIT_LABEL: Record<string, string> = {
  gram: "g",
  kg: "kg",
  ml: "ml",
  liter: "L",
  piece: "pcs",
  dozen: "doz",
};

function getUnitLabel(unit: string): string {
  return UNIT_LABEL[unit] ?? unit;
}

const TABLE_HEADERS = ["Name", "Unit", "Stock", "Threshold", "Status", ""];

export default function IngredientsPage() {
  const { user } = useAuth();
  const isFranchiseAdmin = user?.role === "FRANCHISE_ADMIN";
  const [outletFilter, setOutletFilter] = useState(user?.outletId ?? "ALL");
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const listOutletId =
    user?.outletId ?? (outletFilter !== "ALL" ? outletFilter : undefined);
  const actionOutletId =
    user?.outletId ?? (outletFilter !== "ALL" ? outletFilter : undefined);

  const [searchTerm, setSearchTerm] = useState("");
  const [unitFilter, setUnitFilter] = useState("ALL");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const {
    ingredients,
    loading,
    refreshing,
    totalItems,
    lowStockItems,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
    resetToFirstPage,
    fetchData,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAdjustStock,
  } = useIngredients(
    listOutletId,
    {
      search: searchTerm,
      unit: unitFilter,
      lowStock: lowStockOnly,
      sortBy,
      sortOrder,
    },
    actionOutletId,
    isFranchiseAdmin && !user?.outletId,
  );

  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const [adjustingIngredient, setAdjustingIngredient] =
    useState<Ingredient | null>(null);

  useEffect(() => {
    if (!isFranchiseAdmin || user?.outletId) return;
    void getOutlets()
      .then(setOutlets)
      .catch(() => setOutlets([]));
  }, [isFranchiseAdmin, user?.outletId]);

  const hasActiveFilters =
    searchTerm !== "" ||
    unitFilter !== "ALL" ||
    lowStockOnly ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  const clearFilters = () => {
    setSearchTerm("");
    setUnitFilter("ALL");
    setLowStockOnly(false);
    setSortBy("createdAt");
    setSortOrder("desc");
    if (isFranchiseAdmin && !user?.outletId) setOutletFilter("ALL");
    resetToFirstPage();
  };

  const showShimmer = loading || refreshing;

  if (!listOutletId && !isFranchiseAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <p className="font-medium text-slate-600 dark:text-slate-300">
          No Outlet Assigned
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          You must be assigned to an outlet to manage ingredients.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <IngredientHeader
        refreshing={refreshing}
        canAdd={Boolean(actionOutletId)}
        onRefresh={() => fetchData(true)}
        onAdd={() => setShowForm(true)}
      />

      <IngredientStats
        loading={showShimmer}
        totalItems={totalItems}
        lowStockItems={lowStockItems}
      />

      <IngredientFilters
        searchTerm={searchTerm}
        unitFilter={unitFilter}
        lowStockOnly={lowStockOnly}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={(v) => {
          setSearchTerm(v);
          resetToFirstPage();
        }}
        onUnitChange={(v) => {
          setUnitFilter(v);
          resetToFirstPage();
        }}
        onLowStockChange={(v) => {
          setLowStockOnly(v);
          resetToFirstPage();
        }}
        onSortChange={(by, order) => {
          setSortBy(by);
          setSortOrder(order);
          resetToFirstPage();
        }}
        filterableOutlets={
          isFranchiseAdmin && !user?.outletId ? outlets : undefined
        }
        outletFilter={outletFilter}
        onOutletChange={(v) => {
          setOutletFilter(v);
          resetToFirstPage();
        }}
        hasActiveFilters={
          hasActiveFilters ||
          (isFranchiseAdmin && !user?.outletId && outletFilter !== "ALL")
        }
        onClearFilters={clearFilters}
      />

      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50 dark:divide-white/4">
            {showShimmer ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-4">
                    <Shimmer w="w-32" />
                  </td>
                  <td className="px-5 py-4">
                    <Shimmer w="w-12" h="h-6" rounded="rounded-lg" />
                  </td>
                  <td className="px-5 py-4">
                    <Shimmer w="w-14" />
                  </td>
                  <td className="px-5 py-4">
                    <Shimmer w="w-14" />
                  </td>
                  <td className="px-5 py-4">
                    <Shimmer w="w-16" h="h-6" rounded="rounded-full" />
                  </td>
                  <td className="px-5 py-4">
                    <Shimmer w="w-6" h="h-6" rounded="rounded-md" />
                  </td>
                </tr>
              ))
            ) : ingredients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="font-medium text-slate-600 dark:text-slate-300">
                      {hasActiveFilters
                        ? "No ingredients match your filters"
                        : "No ingredients found"}
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                      {hasActiveFilters
                        ? "Try clearing filters or a different search"
                        : "Add your first ingredient to get started"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              ingredients.map((ing) => {
                const unitFullLabel =
                  UNITS.find((u) => u.value === ing.unit)?.label ?? ing.unit;
                return (
                  <tr
                    key={ing._id}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-slate-800 dark:text-white">
                      {ing.name}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-[13px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/6 px-2 py-0.5 rounded-lg">
                        {unitFullLabel}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-slate-700 dark:text-slate-300">
                      {ing.currentStock}
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-1">
                        {getUnitLabel(ing.unit)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-slate-500 dark:text-slate-400">
                      {ing.minThreshold}
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-1">
                        {getUnitLabel(ing.unit)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <IngredientStockBadge
                        currentStock={ing.currentStock}
                        minThreshold={ing.minThreshold}
                      />
                    </td>
                    <td className="px-5 py-4">
                      {actionOutletId && (
                        <IngredientRowMenu
                          ingredient={ing}
                          onEdit={(i) => {
                            setEditingIngredient(i);
                            setShowForm(true);
                          }}
                          onDelete={() => handleDelete(ing._id)}
                          onAdjustStock={setAdjustingIngredient}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!showShimmer && ingredients.length > 0 && (
          <CursorPagination
            total={totalMatching}
            page={page}
            pageSize={pageSize}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
            onPrevPage={goToPrevPage}
            onNextPage={goToNextPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      <IngredientFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingIngredient(null);
        }}
        ingredient={editingIngredient}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {adjustingIngredient && (
        <StockAdjustModal
          open={Boolean(adjustingIngredient)}
          onClose={() => setAdjustingIngredient(null)}
          ingredient={adjustingIngredient}
          onAdjust={handleAdjustStock}
        />
      )}
    </div>
  );
}
