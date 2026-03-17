import { X, Store, Building2, CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { OrderHistoryFilters, OrderPeriod } from "../types/order.types";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";

const PERIOD_OPTIONS: { value: OrderPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "CREATED", label: "Created" },
  { value: "IN_KITCHEN", label: "In Kitchen" },
  { value: "READY", label: "Ready" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "COMPLETED", label: "Completed" },
] as const;

const PAYMENT_OPTIONS = [
  { value: "ALL", label: "All Payments" },
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "UPI", label: "UPI" },
] as const;

function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

interface OrdersFiltersProps {
  filters: OrderHistoryFilters;
  isSuperAdmin: boolean;
  isFranchiseAdmin: boolean;
  franchises: Franchise[];
  outlets: Outlet[];
  hasActiveFilters: boolean;
  onFilterChange: (patch: Partial<OrderHistoryFilters>) => void;
  onClear: () => void;
}

export function OrdersFilters({
  filters,
  isSuperAdmin,
  isFranchiseAdmin,
  franchises,
  outlets,
  hasActiveFilters,
  onFilterChange,
  onClear,
}: OrdersFiltersProps) {
  const handleDateChange = (value: string) => {
    onFilterChange({ date: value, period: "today" });
  };

  const handlePeriodChange = (value: OrderPeriod) => {
    onFilterChange({ period: value, date: "" });
  };

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-center gap-3 w-max min-w-full">
        {/* Calendar date picker — overrides period when set */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`flex items-center gap-2 h-9 pl-3 pr-2 rounded-xl border bg-white dark:bg-[#161920] transition-all ${
              filters.date
                ? "border-indigo-400 dark:border-indigo-500/60 ring-2 ring-indigo-400/15"
                : "border-slate-100 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/20"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 pointer-events-none" />
            <input
              type="date"
              max={todayLocal()}
              value={filters.date}
              onChange={(e) => handleDateChange(e.target.value)}
              className={`h-full bg-transparent text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer
              ${filters.date ? "w-32" : "w-28"}
            `}
              style={{ colorScheme: "dark" }}
            />
          </div>
          {filters.date && (
            <button
              onClick={() => onFilterChange({ date: "", period: "7d" })}
              title="Clear date"
              className="h-7 w-7 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Period preset — hidden when a specific date is active */}
        {!filters.date && (
          <Select
            value={filters.period}
            onValueChange={(v) => handlePeriodChange(v as OrderPeriod)}
          >
            <SelectTrigger className="h-9 w-38 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20 shrink-0">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
              {PERIOD_OPTIONS.map((o) => (
                <SelectItem
                  key={o.value}
                  value={o.value}
                  className="text-[13px] rounded-lg"
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(v) =>
            onFilterChange({ status: v as OrderHistoryFilters["status"] })
          }
        >
          <SelectTrigger className="h-9 w-38 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20 shrink-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
            {STATUS_OPTIONS.map((o) => (
              <SelectItem
                key={o.value}
                value={o.value}
                className="text-[13px] rounded-lg"
              >
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment method */}
        <Select
          value={filters.paymentMethod}
          onValueChange={(v) =>
            onFilterChange({
              paymentMethod: v as OrderHistoryFilters["paymentMethod"],
            })
          }
        >
          <SelectTrigger className="h-9 w-38 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20 shrink-0">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
            {PAYMENT_OPTIONS.map((o) => (
              <SelectItem
                key={o.value}
                value={o.value}
                className="text-[13px] rounded-lg"
              >
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Franchise filter — super admin only */}
        {isSuperAdmin && (
          <Select
            value={filters.franchiseId || "ALL"}
            onValueChange={(v) =>
              onFilterChange({
                franchiseId: v === "ALL" ? "" : v,
                outletId: "",
              })
            }
          >
            <SelectTrigger className="h-9 w-44 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20 overflow-hidden shrink-0">
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate min-w-0 flex-1">
                  <SelectValue placeholder="All Franchises" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
              <SelectItem value="ALL" className="text-[13px] rounded-lg">
                All Franchises
              </SelectItem>
              {franchises.map((f) => (
                <SelectItem
                  key={f._id}
                  value={f._id}
                  className="text-[13px] rounded-lg"
                >
                  <span className="truncate block max-w-40">{f.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Outlet filter — admin + franchise admin */}
        {(isSuperAdmin || isFranchiseAdmin) && (
          <Select
            value={filters.outletId || "ALL"}
            onValueChange={(v) =>
              onFilterChange({ outletId: v === "ALL" ? "" : v })
            }
          >
            <SelectTrigger className="h-9 w-44 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20 overflow-hidden shrink-0">
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                <Store className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate min-w-0 flex-1">
                  <SelectValue placeholder="All Outlets" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
              <SelectItem value="ALL" className="text-[13px] rounded-lg">
                All Outlets
              </SelectItem>
              {outlets.map((o) => (
                <SelectItem
                  key={o._id}
                  value={o._id}
                  className="text-[13px] rounded-lg"
                >
                  <span className="truncate block max-w-40">{o.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920] text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 transition-all shrink-0"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
