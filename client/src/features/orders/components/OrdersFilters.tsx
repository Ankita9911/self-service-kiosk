import { Search, X, Store, Building2, CalendarDays } from "lucide-react";
import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Combobox } from "@/shared/components/ui/combobox";
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
  chartToggle?: ReactNode;
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
  chartToggle,
  onFilterChange,
  onClear,
}: OrdersFiltersProps) {
  const handleDateChange = (value: string) => {
    onFilterChange({ date: value, period: "today" });
  };

  const handlePeriodChange = (value: OrderPeriod) => {
    onFilterChange({ period: value, date: "" });
  };

  const franchiseOptions = [
    { value: "ALL", label: "All Franchises" },
    ...franchises.map((f) => ({ value: f._id, label: f.name })),
  ];

  const outletOptions = [
    { value: "ALL", label: "All Outlets" },
    ...outlets.map((o) => ({ value: o._id, label: o.name })),
  ];

  return (
    <div className="w-full pb-1">
      <div className="space-y-3">
        <div className="flex items-center gap-3 w-full">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              placeholder="Search by order number…"
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

          {chartToggle && <div className="shrink-0">{chartToggle}</div>}
        </div>

        <div className="flex flex-wrap xl:flex-nowrap items-center gap-3 w-full">
          {/* Franchise — combobox (dynamic) */}
          {isSuperAdmin && (
            <Combobox
              value={filters.franchiseId || "ALL"}
              onValueChange={(v) =>
                onFilterChange({
                  franchiseId: v === "ALL" ? "" : v,
                  outletId: "",
                })
              }
              options={franchiseOptions}
              placeholder="All Franchises"
              searchPlaceholder="Search franchises…"
              emptyText="No franchises found"
              icon={<Building2 className="w-3.5 h-3.5" />}
              className="w-full min-w-44 flex-1"
            />
          )}

          {/* Outlet — combobox (dynamic) */}
          {(isSuperAdmin || isFranchiseAdmin) && (
            <Combobox
              value={filters.outletId || "ALL"}
              onValueChange={(v) =>
                onFilterChange({ outletId: v === "ALL" ? "" : v })
              }
              options={outletOptions}
              placeholder="All Outlets"
              searchPlaceholder="Search outlets…"
              emptyText="No outlets found"
              icon={<Store className="w-3.5 h-3.5" />}
              className="w-full min-w-44 flex-1"
            />
          )}

          {/* Calendar date picker */}
          <div className="flex items-center gap-1.5 min-w-64 flex-[1.35]">
            <div
              className={`flex items-center gap-2 h-9 w-full pl-3 pr-2 rounded-xl border bg-white dark:bg-[#161920] transition-all ${
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
                className="h-full flex-1 min-w-0 bg-transparent text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
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

          {/* Period — keep as Select (5 fixed options, hidden when date active) */}
          {!filters.date && (
            <div className="min-w-40 flex-1">
              <Select
                value={filters.period}
                onValueChange={(v) => handlePeriodChange(v as OrderPeriod)}
              >
                <SelectTrigger className="h-9 w-full rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
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
            </div>
          )}

          {/* Status — keep as Select (6 fixed options) */}
          <div className="min-w-40 flex-1">
            <Select
              value={filters.status}
              onValueChange={(v) =>
                onFilterChange({ status: v as OrderHistoryFilters["status"] })
              }
            >
              <SelectTrigger className="h-9 w-full rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
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
          </div>

          {/* Payment — keep as Select (4 fixed options) */}
          <div className="min-w-40 flex-1">
            <Select
              value={filters.paymentMethod}
              onValueChange={(v) =>
                onFilterChange({
                  paymentMethod: v as OrderHistoryFilters["paymentMethod"],
                })
              }
            >
              <SelectTrigger className="h-9 w-full rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
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
          </div>

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
    </div>
  );
}
