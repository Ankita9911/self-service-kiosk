import { useState, useEffect, useCallback, useRef } from "react";
import useAuth from "@/shared/hooks/useAuth";
import {
  useStockTransactions,
  type StockTransactionFilters,
} from "@/features/stockTransactions/hooks/useStockTransactions";
import { getAllIngredients } from "@/features/ingredients/services/ingredient.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import { CursorPagination } from "@/shared/components/ui/CursorPagination";
import type { Ingredient } from "@/features/ingredients/types/ingredient.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import type { ManualTransactionPayload, StockTransactionSortBy } from "@/features/stockTransactions/types/stockTransaction.types";
import {
  ArrowUpDown,
  Plus,
  Loader2,
  PackagePlus,
  PackageMinus,
  ArrowRightLeft,
  ShoppingCart,
  X,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FlaskConical,
  RefreshCcw,
  TrendingDown,
  ShieldAlert,
  Store,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

// ── Types ────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "CONSUMPTION", label: "Consumption" },
  { value: "WASTAGE", label: "Wastage" },
  { value: "ADJUSTMENT", label: "Adjustment" },
] as const;

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  PURCHASE: {
    icon: <PackagePlus className="w-3.5 h-3.5" />,
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
    label: "Purchase",
  },
  CONSUMPTION: {
    icon: <ShoppingCart className="w-3.5 h-3.5" />,
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
    label: "Consumption",
  },
  WASTAGE: {
    icon: <PackageMinus className="w-3.5 h-3.5" />,
    color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10",
    label: "Wastage",
  },
  ADJUSTMENT: {
    icon: <ArrowRightLeft className="w-3.5 h-3.5" />,
    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
    label: "Adjustment",
  },
};

// ── Shimmer ───────────────────────────────────────────────

function StatPill({
  icon,
  label,
  value,
  iconBg,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBg: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/6 shadow-sm">
        <div className="relative overflow-hidden h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/6 shrink-0">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="relative overflow-hidden h-5 w-8 rounded bg-slate-100 dark:bg-white/6">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
          <div className="relative overflow-hidden h-3 w-16 rounded bg-slate-100 dark:bg-white/6">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/6 shadow-sm">
      <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{value.toLocaleString()}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ── Sort header icon ──────────────────────────────────────

function SortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: StockTransactionSortBy;
  sortBy: StockTransactionSortBy;
  sortOrder: "asc" | "desc";
}) {
  if (sortBy !== column) return <ChevronsUpDown className="w-3 h-3 ml-1 text-slate-300 dark:text-slate-600" />;
  return sortOrder === "asc" ? (
    <ChevronUp className="w-3 h-3 ml-1 text-indigo-500" />
  ) : (
    <ChevronDown className="w-3 h-3 ml-1 text-indigo-500" />
  );
}

// ── Helper ────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function qtyDisplay(txn: { type: string; quantity: number }) {
  if (txn.type === "PURCHASE") return `+${Math.abs(txn.quantity)}`;
  if (txn.type === "ADJUSTMENT") return txn.quantity > 0 ? `+${txn.quantity}` : String(txn.quantity);
  return `-${Math.abs(txn.quantity)}`;
}

function qtyColor(txn: { type: string; quantity: number }) {
  if (txn.type === "PURCHASE") return "text-emerald-600 dark:text-emerald-400";
  if (txn.type === "ADJUSTMENT") return txn.quantity >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400";
  return "text-red-500 dark:text-red-400";
}

function shortUnit(unit?: string) {
  if (unit === "gram") return "g";
  if (unit === "ml") return "ml";
  if (unit === "piece") return "pc";
  if (unit === "kg") return "kg";
  if (unit === "liter") return "L";
  if (unit === "dozen") return "dz";
  return unit ?? "";
}

// ── Page ──────────────────────────────────────────────────

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

  // Filters
  const [filters, setFilters] = useState<StockTransactionFilters>(DEFAULT_FILTERS);

  // All ingredients for filter dropdown
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

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
    transactions,
    loading,
    refreshing,
    filterLoading,
    stats,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
    resetToFirstPage,
    refreshAll,
    handleCreate,
  } = useStockTransactions(
    listOutletId,
    filters,
    actionOutletId,
    isFranchiseAdmin && !user?.outletId
  );

  // When filter changes, reset to page 1
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const changed =
      prev.search !== filters.search ||
      prev.ingredientId !== filters.ingredientId ||
      prev.type !== filters.type ||
      prev.sortBy !== filters.sortBy ||
      prev.sortOrder !== filters.sortOrder;
    if (changed) {
      resetToFirstPage();
    }
    prevFiltersRef.current = filters;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.ingredientId, filters.type, filters.sortBy, filters.sortOrder]);

  // Sort toggle
  function handleSort(col: StockTransactionSortBy) {
    resetToFirstPage();
    setFilters((prev) => ({
      ...prev,
      sortBy: col,
      sortOrder: prev.sortBy === col && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  }

  // Clear all filters
  const hasActiveFilters =
    filters.search !== "" ||
    filters.ingredientId !== "" ||
    filters.type !== "" ||
    (isFranchiseAdmin && !user?.outletId && outletFilter !== "ALL");

  function clearFilters() {
    if (isFranchiseAdmin && !user?.outletId) setOutletFilter("ALL");
    setFilters((prev) => ({ ...prev, search: "", ingredientId: "", type: "" }));
  }

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ManualTransactionPayload>({
    ingredientId: "",
    type: "PURCHASE",
    quantity: 0,
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  function openForm() {
    setFormData({ ingredientId: "", type: "PURCHASE", quantity: 0, note: "" });
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setFormError("");
  }

  async function handleSubmit() {
    setFormError("");
    if (!formData.ingredientId) { setFormError("Please select an ingredient."); return; }
    if (!formData.quantity || formData.quantity === 0) { setFormError("Quantity must be non-zero."); return; }
    setSaving(true);
    try {
      await handleCreate(formData);
      setShowForm(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setFormError(msg ?? "Failed to log transaction.");
    } finally {
      setSaving(false);
    }
  }

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
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Stock Log
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Review inventory movement history and create manual stock entries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshAll(true)}
            disabled={refreshing}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openForm}
            disabled={!actionOutletId}
            className="inline-flex items-center justify-center rounded-xl h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Transaction
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatPill
          loading={loading}
          value={stats.purchaseCount}
          label="Purchases"
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          icon={<PackagePlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        />
        <StatPill
          loading={loading}
          value={stats.consumptionCount}
          label="Consumption"
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          icon={<ShoppingCart className="w-4 h-4 text-blue-500" />}
        />
        <StatPill
          loading={loading}
          value={stats.wastageCount}
          label="Wastage"
          iconBg="bg-red-50 dark:bg-red-500/10"
          icon={<TrendingDown className="w-4 h-4 text-red-500" />}
        />
        <StatPill
          loading={loading}
          value={stats.adjustmentCount}
          label="Adjustments"
          iconBg="bg-amber-50 dark:bg-amber-500/10"
          icon={<ArrowRightLeft className="w-4 h-4 text-amber-500" />}
        />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            placeholder="Search by ingredient name…"
            className="w-full h-9 pl-9 pr-9 rounded-xl bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 text-[13px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-400/15 dark:focus:ring-indigo-500/10 transition-all"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 flex items-center justify-center transition-colors"
            >
              <X className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" />
            </button>
          )}
        </div>

        {isFranchiseAdmin && !user?.outletId && (
          <Select value={outletFilter} onValueChange={(v) => { setOutletFilter(v); resetToFirstPage(); }}>
            <SelectTrigger className="h-9 w-44 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
              <div className="flex items-center gap-2 min-w-0">
                <Store className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <SelectValue placeholder="All Outlets" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
              <SelectItem value="ALL" className="text-[13px] rounded-lg">All Outlets</SelectItem>
              {outlets.map((outlet) => (
                <SelectItem key={outlet._id} value={outlet._id} className="text-[13px] rounded-lg">
                  {outlet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Ingredient dropdown */}
        <Select
          value={filters.ingredientId || "ALL"}
          onValueChange={(v) => setFilters((prev) => ({ ...prev, ingredientId: v === "ALL" ? "" : v }))}
        >
          <SelectTrigger className="h-9 w-52 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <FlaskConical className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate min-w-0 flex-1">
                <SelectValue placeholder="All Ingredients" />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26] max-w-56">
            <SelectItem value="ALL" className="text-[13px] rounded-lg px-2 py-1.5">
              All Ingredients
            </SelectItem>
            {allIngredients.map((ing) => (
              <SelectItem key={ing._id} value={ing._id} className="text-[13px] rounded-lg px-2 py-1.5">
                <span className="truncate block max-w-44">
                  {ing.name} ({shortUnit(ing.unit)})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type toggle */}
        <div className="flex gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 rounded-xl p-1 flex-wrap">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilters((prev) => ({ ...prev, type: opt.value }))}
              className={`px-3 h-7 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                filters.type === opt.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920] text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 transition-all shrink-0"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {tableLoading && !refreshing ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20">
          <ArrowUpDown className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No transactions found.</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-2 text-xs text-indigo-500 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
                  {/* Date — sortable */}
                  <th
                    className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    <span className="inline-flex items-center">
                      Date
                      <SortIcon column="createdAt" sortBy={filters.sortBy} sortOrder={filters.sortOrder} />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Ingredient
                  </th>
                  {/* Type — sortable */}
                  <th
                    className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    onClick={() => handleSort("type")}
                  >
                    <span className="inline-flex items-center">
                      Type
                      <SortIcon column="type" sortBy={filters.sortBy} sortOrder={filters.sortOrder} />
                    </span>
                  </th>
                  {/* Qty — sortable */}
                  <th
                    className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    onClick={() => handleSort("quantity")}
                  >
                    <span className="inline-flex items-center justify-end">
                      Qty
                      <SortIcon column="quantity" sortBy={filters.sortBy} sortOrder={filters.sortOrder} />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Reference
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-50 dark:divide-white/4 ${filterLoading ? "opacity-60 pointer-events-none" : ""}`}>
                {transactions.map((txn) => {
                  const cfg = TYPE_CONFIG[txn.type] ?? TYPE_CONFIG.ADJUSTMENT;
                  const ingredientName =
                    typeof txn.ingredientId === "object" && txn.ingredientId
                      ? (txn.ingredientId as { name: string }).name
                      : String(txn.ingredientId);
                  const unit =
                    typeof txn.ingredientId === "object" && txn.ingredientId
                      ? (txn.ingredientId as { unit?: string }).unit ?? ""
                      : "";

                  return (
                    <tr
                      key={txn._id}
                      className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                        {formatDate(txn.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {ingredientName}
                        {unit && (
                          <span className="ml-1 text-[11px] text-slate-400 font-normal">({shortUnit(unit)})</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold text-sm ${qtyColor(txn)}`}>
                        {qtyDisplay(txn)}
                        {unit && (
                          <span className="ml-1 text-[10px] text-slate-400 font-normal">{shortUnit(unit)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            txn.referenceType === "ORDER"
                              ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                              : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {txn.referenceType === "ORDER" ? "Order" : "Manual"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-50 truncate">
                        {txn.note || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
        </div>
      )}

      {/* ── Log Transaction Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={closeForm}
          />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#1e2130] rounded-2xl shadow-2xl shadow-black/30 border border-slate-100 dark:border-white/8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
                  <ArrowUpDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Log Stock Transaction</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Create a manual purchase, wastage, or adjustment entry.
                  </p>
                </div>
              </div>
              <button
                onClick={closeForm}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 px-6 py-5">
              {formError && (
                <div className="px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Ingredient</Label>
                <Select
                  value={formData.ingredientId}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, ingredientId: v }))}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8 text-[13px]">
                    <SelectValue placeholder="Select ingredient…" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
                    {allIngredients.map((ing) => (
                      <SelectItem key={ing._id} value={ing._id} className="text-[13px] rounded-lg">
                        {ing.name}
                        <span className="ml-1.5 text-slate-400 text-[11px]">
                          ({ing.currentStock} {shortUnit(ing.unit)})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Transaction Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["PURCHASE", "WASTAGE", "ADJUSTMENT"] as const).map((t) => {
                    const cfg = TYPE_CONFIG[t];
                    const active = formData.type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, type: t }))}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-[11px] font-semibold transition-all ${
                          active
                            ? "border-indigo-400 dark:border-indigo-500/60 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                            : "border-slate-200 dark:border-white/8 bg-white dark:bg-white/3 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/15"
                        }`}
                      >
                        <span className={active ? "text-indigo-500" : "text-slate-400"}>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Quantity
                  {formData.type === "ADJUSTMENT" && (
                    <span className="ml-1.5 font-normal text-slate-400">(negative to deduct)</span>
                  )}
                </Label>
                <Input
                  type="number"
                  step="any"
                  placeholder={formData.type === "ADJUSTMENT" ? "e.g. −5 or +10" : "e.g. 25"}
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                  }
                  className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Note (optional)</Label>
                <Input
                  placeholder="Reason for transaction…"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !formData.ingredientId || !formData.quantity}
                className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Log Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
