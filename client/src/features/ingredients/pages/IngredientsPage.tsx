import { useState } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { useIngredients } from "@/features/ingredients/hooks/useIngredients";
import { IngredientStats } from "@/features/ingredients/components/IngredientStats";
import { IngredientFilters } from "@/features/ingredients/components/IngredientFilters";
import { IngredientFormModal, UNITS } from "@/features/ingredients/components/IngredientFormModal";
import { IngredientRowMenu } from "@/features/ingredients/components/IngredientRowMenu";
import { StockAdjustModal } from "@/features/ingredients/components/StockAdjustModal";
import { CursorPagination } from "@/shared/components/ui/CursorPagination";
import { Shimmer } from "@/features/device/components/ShimmerCell";
import type { Ingredient } from "@/features/ingredients/types/ingredient.types";
import {
  Package,
  Plus,
  RefreshCcw,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

// Unit display labels
const UNIT_LABEL: Record<string, string> = {
  gram: "g", kg: "kg", ml: "ml", liter: "L", piece: "pcs", dozen: "doz",
};

function getUnitLabel(unit: string): string {
  return UNIT_LABEL[unit] ?? unit;
}

export default function IngredientsPage() {
  const { user } = useAuth();
  const outletId = user?.outletId ?? undefined;

  // Filters
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
  } = useIngredients(outletId, {
    search: searchTerm,
    unit: unitFilter,
    lowStock: lowStockOnly,
    sortBy,
    sortOrder,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [adjustingIngredient, setAdjustingIngredient] = useState<Ingredient | null>(null);

  const hasActiveFilters =
    searchTerm !== "" || unitFilter !== "ALL" || lowStockOnly ||
    sortBy !== "createdAt" || sortOrder !== "desc";

  const clearFilters = () => {
    setSearchTerm("");
    setUnitFilter("ALL");
    setLowStockOnly(false);
    setSortBy("createdAt");
    setSortOrder("desc");
    resetToFirstPage();
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIngredient(null);
  };

  const showShimmer = loading || refreshing;

  // Restrict access if no outletId
  if (!outletId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <p className="font-medium text-slate-600 dark:text-slate-300">No Outlet Assigned</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          You must be assigned to an outlet to manage ingredients.
        </p>
      </div>
    );
  }

  const tableHeaders = ["Name", "Unit", "Stock", "Threshold", "Status", ""];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
            Ingredients
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage kitchen inventory, thresholds, and stock movements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Ingredient
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <IngredientStats
        loading={showShimmer}
        totalItems={totalItems}
        lowStockItems={lowStockItems}
      />

      {/* ── Filters ── */}
      <IngredientFilters
        searchTerm={searchTerm}
        unitFilter={unitFilter}
        lowStockOnly={lowStockOnly}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={(v) => { setSearchTerm(v); resetToFirstPage(); }}
        onUnitChange={(v) => { setUnitFilter(v); resetToFirstPage(); }}
        onLowStockChange={(v) => { setLowStockOnly(v); resetToFirstPage(); }}
        onSortChange={(by, order) => { setSortBy(by); setSortOrder(order); resetToFirstPage(); }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
              {tableHeaders.map((h) => (
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
                  {/* Name */}
                  <td className="px-5 py-4"><Shimmer w="w-32" /></td>
                  {/* Unit badge */}
                  <td className="px-5 py-4"><Shimmer w="w-12" h="h-6" rounded="rounded-lg" /></td>
                  {/* Stock */}
                  <td className="px-5 py-4"><Shimmer w="w-14" /></td>
                  {/* Threshold */}
                  <td className="px-5 py-4"><Shimmer w="w-14" /></td>
                  {/* Status */}
                  <td className="px-5 py-4"><Shimmer w="w-16" h="h-6" rounded="rounded-full" /></td>
                  {/* Actions */}
                  <td className="px-5 py-4"><Shimmer w="w-6" h="h-6" rounded="rounded-md" /></td>
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
                      {hasActiveFilters ? "No ingredients match your filters" : "No ingredients found"}
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
                const isLow = ing.currentStock < ing.minThreshold;
                const unitFullLabel = UNITS.find((u) => u.value === ing.unit)?.label ?? ing.unit;
                return (
                  <tr
                    key={ing._id}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-4 text-sm font-medium text-slate-800 dark:text-white">
                      {ing.name}
                    </td>

                    {/* Unit badge */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-[13px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/6 px-2 py-0.5 rounded-lg">
                        {unitFullLabel}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4 text-sm font-mono text-slate-700 dark:text-slate-300">
                      {ing.currentStock}
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-1">
                        {getUnitLabel(ing.unit)}
                      </span>
                    </td>

                    {/* Threshold */}
                    <td className="px-5 py-4 text-sm font-mono text-slate-500 dark:text-slate-400">
                      {ing.minThreshold}
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-1">
                        {getUnitLabel(ing.unit)}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isLow
                            ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          }`}
                      >
                        {isLow && <AlertTriangle className="w-3 h-3" />}
                        {isLow ? "Low Stock" : "In Stock"}
                      </span>
                    </td>

                    {/* Three-dot menu */}
                    <td className="px-5 py-4">
                      <IngredientRowMenu
                        ingredient={ing}
                        onEdit={handleEdit}
                        onDelete={() => handleDelete(ing._id)}
                        onAdjustStock={setAdjustingIngredient}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
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

      {/* ── Form Modal ── */}
      <IngredientFormModal
        open={showForm}
        onClose={handleCloseForm}
        ingredient={editingIngredient}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* ── Stock Adjust Modal ── */}
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
