import { Search, FlaskConical, Store, X } from "lucide-react";
import { Combobox } from "@/shared/components/ui/combobox";
import type { Ingredient } from "@/features/ingredients/types/ingredient.types";
import type { MenuItem } from "@/features/kiosk/types/menu.types";
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
  directStockItems: MenuItem[];
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
  filters,
  allIngredients,
  directStockItems,
  outlets,
  outletFilter,
  isFranchiseAdmin,
  hasOutletId,
  hasActiveFilters,
  onFilterChange,
  onOutletChange,
  onClearFilters,
  onResetPage,
}: StockTransactionFiltersProps) {
  const outletOptions = [
    { value: "ALL", label: "All Outlets" },
    ...outlets.map((o) => ({ value: o._id, label: o.name })),
  ];

  const ingredientOptions = [
    { value: "ALL", label: "All Ingredients" },
    ...allIngredients.map((ing) => ({
      value: ing._id,
      label: `${ing.name} (${shortUnit(ing.unit)})`,
    })),
  ];

  const directItemOptions = [
    { value: "ALL", label: "All Direct Stock Items" },
    ...directStockItems.map((item) => ({
      value: item._id,
      label: item.name,
    })),
  ];

  const mixedItemOptions = [
    { value: "ALL", label: "All Items" },
    ...allIngredients.map((ing) => ({
      value: `ING:${ing._id}`,
      label: `[Ingredient] ${ing.name} (${shortUnit(ing.unit)})`,
    })),
    ...directStockItems.map((item) => ({
      value: `DIR:${item._id}`,
      label: `[Direct] ${item.name}`,
    })),
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      {/* Search */}
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

      {/* Outlet — combobox */}
      {isFranchiseAdmin && !hasOutletId && (
        <Combobox
          value={outletFilter}
          onValueChange={(v) => { onOutletChange(v); onResetPage(); }}
          options={outletOptions}
          placeholder="All Outlets"
          searchPlaceholder="Search outlets…"
          emptyText="No outlets found"
          icon={<Store className="w-3.5 h-3.5" />}
          className="w-44"
        />
      )}

      {/* Ingredient — combobox */}
      <Combobox
        value={filters.sourceType || "ALL"}
        onValueChange={(v) =>
          onFilterChange({
            sourceType:
              v === "ALL" ? "" : (v as "INGREDIENT" | "MENU_ITEM"),
            itemId: "",
          })
        }
        options={[
          { value: "ALL", label: "All Sources" },
          { value: "INGREDIENT", label: "Ingredients" },
          { value: "MENU_ITEM", label: "Direct Stock Items" },
        ]}
        placeholder="All Sources"
        searchPlaceholder="Search sources…"
        emptyText="No sources found"
        className="w-48"
      />

      <Combobox
        value={filters.itemId || "ALL"}
        onValueChange={(v) => {
          if (v === "ALL") {
            onFilterChange({ itemId: "" });
            return;
          }

          if (filters.sourceType === "") {
            if (v.startsWith("ING:")) {
              onFilterChange({
                sourceType: "INGREDIENT",
                itemId: v.replace(/^ING:/, ""),
              });
              return;
            }

            if (v.startsWith("DIR:")) {
              onFilterChange({
                sourceType: "MENU_ITEM",
                itemId: v.replace(/^DIR:/, ""),
              });
              return;
            }
          }

          onFilterChange({ itemId: v });
        }}
        options={
          filters.sourceType === "MENU_ITEM"
            ? directItemOptions
            : filters.sourceType === "INGREDIENT"
              ? ingredientOptions
              : mixedItemOptions
        }
        placeholder={
          filters.sourceType === "MENU_ITEM"
            ? "All Direct Stock Items"
            : filters.sourceType === "INGREDIENT"
              ? "All Ingredients"
              : "All Items"
        }
        searchPlaceholder={
          filters.sourceType === "MENU_ITEM"
            ? "Search direct stock items…"
            : filters.sourceType === "INGREDIENT"
              ? "Search ingredients…"
              : "Search ingredients and direct stock items…"
        }
        emptyText={
          filters.sourceType === "MENU_ITEM"
            ? "No direct stock items found"
            : filters.sourceType === "INGREDIENT"
              ? "No ingredients found"
              : "No items found"
        }
        icon={<FlaskConical className="w-3.5 h-3.5" />}
        className="w-52"
      />

      {/* Type toggle — small fixed list, keep as pill buttons */}
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

      {/* Clear */}
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
