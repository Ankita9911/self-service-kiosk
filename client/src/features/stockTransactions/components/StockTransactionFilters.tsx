import { Search, FlaskConical, Store, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Ingredient } from "@/features/ingredients/types/ingredient.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import type { StockTransactionFilters } from "../hooks/useStockTransactions";
import { shortUnit } from "../utils/stockTransaction.utils";

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "CONSUMPTION", label: "Consumption" },
  { value: "WASTAGE", label: "Wastage" },
  { value: "ADJUSTMENT", label: "Adjustment" },
] as const;

interface StockTransactionFiltersProps {
  filters: StockTransactionFilters;
  allIngredients: Ingredient[];
  outlets: Outlet[];
  outletFilter: string;
  isFranchiseAdmin: boolean;
  hasOutletId: boolean;
  hasActiveFilters: boolean;
  onFilterChange: (patch: Partial<StockTransactionFilters>) => void;
  onOutletChange: (v: string) => void;
  onClearFilters: () => void;
  onResetPage: () => void;
}

export function StockTransactionFilters({
  filters, allIngredients, outlets, outletFilter,
  isFranchiseAdmin, hasOutletId,
  hasActiveFilters,
  onFilterChange, onOutletChange, onClearFilters, onResetPage,
}: StockTransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div className="relative flex-1 min-w-52">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          placeholder="Search by ingredient name…"
          className="w-full h-9 pl-9 pr-9 rounded-xl bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 text-[13px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-400/15 dark:focus:ring-indigo-500/10 transition-all"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ search: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 flex items-center justify-center transition-colors"
          >
            <X className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" />
          </button>
        )}
      </div>

      {isFranchiseAdmin && !hasOutletId && (
        <Select value={outletFilter} onValueChange={(v) => { onOutletChange(v); onResetPage(); }}>
          <SelectTrigger className="h-9 w-44 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
            <div className="flex items-center gap-2 min-w-0">
              <Store className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <SelectValue placeholder="All Outlets" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
            <SelectItem value="ALL" className="text-[13px] rounded-lg">All Outlets</SelectItem>
            {outlets.map((o) => (
              <SelectItem key={o._id} value={o._id} className="text-[13px] rounded-lg">{o.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={filters.ingredientId || "ALL"}
        onValueChange={(v) => onFilterChange({ ingredientId: v === "ALL" ? "" : v })}
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
          <SelectItem value="ALL" className="text-[13px] rounded-lg px-2 py-1.5">All Ingredients</SelectItem>
          {allIngredients.map((ing) => (
            <SelectItem key={ing._id} value={ing._id} className="text-[13px] rounded-lg px-2 py-1.5">
              <span className="truncate block max-w-44">
                {ing.name} ({shortUnit(ing.unit)})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 rounded-xl p-1 flex-wrap">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterChange({ type: opt.value })}
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

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920] text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 transition-all shrink-0"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
