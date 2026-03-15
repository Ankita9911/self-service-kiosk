import { useState, useEffect, useCallback, useRef } from "react";
import useAuth from "@/shared/hooks/useAuth";
import {
  useStockTransactions,
  type StockTransactionFilters,
} from "@/features/stockTransactions/hooks/useStockTransactions";
import { getAllIngredients } from "@/features/ingredients/services/ingredient.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import { StockTransactionStats } from "../components/StockTransactionStats";
import { StockTransactionFilters as TransactionFilters } from "../components/StockTransactionFilters";
import { StockTransactionTable } from "../components/StockTransactionTable";
import { LogTransactionModal } from "../components/LogTransactionModal";
import type { Ingredient } from "@/features/ingredients/types/ingredient.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import type { StockTransactionSortBy } from "../types/stockTransaction.types";
import { Plus, Loader2, RefreshCcw, ShieldAlert } from "lucide-react";

const DEFAULT_FILTERS: StockTransactionFilters = {
  search: "",
  ingredientId: "",
  type: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export default function StockTransactionsPage() {
  const { user } = useAuth();
  const isFranchiseAdmin = user?.role === "FRANCHISE_ADMIN";
  const [outletFilter, setOutletFilter] = useState(user?.outletId ?? "ALL");
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const listOutletId = user?.outletId ?? (outletFilter !== "ALL" ? outletFilter : undefined);
  const actionOutletId = user?.outletId ?? (outletFilter !== "ALL" ? outletFilter : undefined);

  const [filters, setFilters] = useState<StockTransactionFilters>(DEFAULT_FILTERS);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isFranchiseAdmin || user?.outletId) return;
    void getOutlets().then(setOutlets).catch(() => setOutlets([]));
  }, [isFranchiseAdmin, user?.outletId]);

  const fetchIngredients = useCallback(async () => {
    try {
      const result = await getAllIngredients(listOutletId);
      setAllIngredients(result);
    } catch {
      // non-fatal
    }
  }, [listOutletId]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const {
    transactions, loading, refreshing, filterLoading,
    stats, totalMatching,
    page, pageSize, hasPrevPage, hasNextPage,
    goToNextPage, goToPrevPage, setPageSize, resetToFirstPage,
    refreshAll, handleCreate,
  } = useStockTransactions(
    listOutletId, filters, actionOutletId, isFranchiseAdmin && !user?.outletId
  );

  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const changed =
      prev.search !== filters.search ||
      prev.ingredientId !== filters.ingredientId ||
      prev.type !== filters.type ||
      prev.sortBy !== filters.sortBy ||
      prev.sortOrder !== filters.sortOrder;
    if (changed) resetToFirstPage();
    prevFiltersRef.current = filters;
  }, [filters.search, filters.ingredientId, filters.type, filters.sortBy, filters.sortOrder]);

  const handleSort = (col: StockTransactionSortBy) => {
    resetToFirstPage();
    setFilters((prev) => ({
      ...prev,
      sortBy: col,
      sortOrder: prev.sortBy === col && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.ingredientId !== "" ||
    filters.type !== "" ||
    (isFranchiseAdmin && !user?.outletId && outletFilter !== "ALL");

  const clearFilters = () => {
    if (isFranchiseAdmin && !user?.outletId) setOutletFilter("ALL");
    setFilters((prev) => ({ ...prev, search: "", ingredientId: "", type: "" }));
  };

  const handleSubmitTransaction = async (payload: Parameters<typeof handleCreate>[0]) => {
    await handleCreate(payload);
  };

  const tableLoading = loading || filterLoading;

  if (!listOutletId && !isFranchiseAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <p className="font-medium text-slate-600 dark:text-slate-300">No Outlet Assigned</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          You must be assigned to an outlet to manage stock transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
            Stock Log
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review inventory movement history and create manual stock entries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshAll(true)}
            disabled={refreshing}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            disabled={!actionOutletId}
            className="inline-flex items-center justify-center rounded-xl h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Transaction
          </button>
        </div>
      </div>

      <StockTransactionStats stats={stats} loading={loading} />

      <TransactionFilters
        filters={filters}
        allIngredients={allIngredients}
        outlets={outlets}
        outletFilter={outletFilter}
        isFranchiseAdmin={isFranchiseAdmin}
        hasOutletId={Boolean(user?.outletId)}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onOutletChange={setOutletFilter}
        onClearFilters={clearFilters}
        onResetPage={resetToFirstPage}
      />

      {tableLoading && !refreshing ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <StockTransactionTable
          transactions={transactions}
          filterLoading={filterLoading}
          hasActiveFilters={hasActiveFilters}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          total={totalMatching}
          page={page}
          pageSize={pageSize}
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
          onSort={handleSort}
          onClearFilters={clearFilters}
          onPrevPage={goToPrevPage}
          onNextPage={goToNextPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {showForm && (
        <LogTransactionModal
          allIngredients={allIngredients}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmitTransaction}
        />
      )}
    </div>
  );
}
