import {
  PackagePlus,
  ShoppingCart,
  PackageMinus,
  ArrowRightLeft,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ArrowUpDown,
} from "lucide-react";
import { CursorPagination } from "@/shared/components/ui/CursorPagination";
import type {
  StockTransaction,
  StockTransactionSortBy,
} from "../types/stockTransaction.types";
import {
  formatDate,
  qtyDisplay,
  qtyColor,
  shortUnit,
} from "../utils/stockTransaction.utils";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; label: string }
> = {
  PURCHASE: {
    icon: <PackagePlus className="w-3.5 h-3.5" />,
    color:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
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
    color:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
    label: "Adjustment",
  },
};

interface SortIconProps {
  column: StockTransactionSortBy;
  sortBy: StockTransactionSortBy;
  sortOrder: "asc" | "desc";
}

function SortIcon({ column, sortBy, sortOrder }: SortIconProps) {
  if (sortBy !== column)
    return (
      <ChevronsUpDown className="w-3 h-3 ml-1 text-slate-300 dark:text-slate-600" />
    );
  return sortOrder === "asc" ? (
    <ChevronUp className="w-3 h-3 ml-1 text-indigo-500" />
  ) : (
    <ChevronDown className="w-3 h-3 ml-1 text-indigo-500" />
  );
}

interface StockTransactionTableProps {
  transactions: StockTransaction[];
  filterLoading: boolean;
  hasActiveFilters: boolean;
  sortBy: StockTransactionSortBy;
  sortOrder: "asc" | "desc";
  total: number;
  page: number;
  pageSize: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onSort: (col: StockTransactionSortBy) => void;
  onClearFilters: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (size: number) => void;
}

export function StockTransactionTable({
  transactions,
  filterLoading,
  hasActiveFilters,
  sortBy,
  sortOrder,
  total,
  page,
  pageSize,
  hasPrevPage,
  hasNextPage,
  onSort,
  onClearFilters,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
}: StockTransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-20">
        <ArrowUpDown className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          No transactions found.
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="mt-2 text-xs text-indigo-500 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
              <th
                className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => onSort("createdAt")}
              >
                <span className="inline-flex items-center">
                  Date
                  <SortIcon
                    column="createdAt"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </span>
              </th>
              <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Item
              </th>
              <th
                className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => onSort("type")}
              >
                <span className="inline-flex items-center">
                  Type
                  <SortIcon
                    column="type"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </span>
              </th>
              <th
                className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => onSort("quantity")}
              >
                <span className="inline-flex items-center justify-end">
                  Qty
                  <SortIcon
                    column="quantity"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
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
          <tbody
            className={`divide-y divide-slate-50 dark:divide-white/4 ${filterLoading ? "opacity-60 pointer-events-none" : ""}`}
          >
            {transactions.map((txn) => {
              const cfg = TYPE_CONFIG[txn.type] ?? TYPE_CONFIG.ADJUSTMENT;
              const isMenuItemSource =
                txn.sourceType === "MENU_ITEM" || Boolean(txn.menuItemId);

              const itemName = isMenuItemSource
                ? typeof txn.menuItemId === "object" && txn.menuItemId
                  ? (txn.menuItemId as { name: string }).name
                  : String(txn.menuItemId || "-")
                : typeof txn.ingredientId === "object" && txn.ingredientId
                  ? (txn.ingredientId as { name: string }).name
                  : String(txn.ingredientId || "-");

              const unit =
                !isMenuItemSource &&
                typeof txn.ingredientId === "object" &&
                txn.ingredientId
                  ? ((txn.ingredientId as { unit?: string }).unit ?? "")
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
                    {itemName}
                    {unit && (
                      <span className="ml-1 text-[11px] text-slate-400 font-normal">
                        ({shortUnit(unit)})
                      </span>
                    )}
                    <span
                      className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        isMenuItemSource
                          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                      }`}
                    >
                      {isMenuItemSource ? "Direct" : "Ingredient"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono font-semibold text-sm ${qtyColor(txn)}`}
                  >
                    {qtyDisplay(txn)}
                    {unit && (
                      <span className="ml-1 text-[10px] text-slate-400 font-normal">
                        {shortUnit(unit)}
                      </span>
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
                    {txn.note || (
                      <span className="text-slate-300 dark:text-slate-600">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CursorPagination
        total={total}
        page={page}
        pageSize={pageSize}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
