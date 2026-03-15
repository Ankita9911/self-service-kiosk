import { Search, X, Building2, Store } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";

interface Props {
  searchTerm: string;
  statusFilter: "ALL" | "ACTIVE" | "INACTIVE";
  onSearchChange: (v: string) => void;
  onStatusChange: (v: "ALL" | "ACTIVE" | "INACTIVE") => void;
  // franchise filter (super admin only)
  isSuperAdmin?: boolean;
  franchises?: Franchise[];
  franchiseFilter?: string;
  onFranchiseChange?: (v: string) => void;
  // outlet filter
  filterableOutlets?: Outlet[];
  outletFilter?: string;
  onOutletChange?: (v: string) => void;
  // clear all
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function DeviceFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  isSuperAdmin,
  franchises,
  franchiseFilter,
  onFranchiseChange,
  filterableOutlets,
  outletFilter,
  onOutletChange,
  hasActiveFilters,
  onClearFilters,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-52">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          placeholder="Search by device ID or name…"
          className="w-full h-9 pl-9 pr-9 rounded-xl bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 text-[13px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-400/15 dark:focus:ring-indigo-500/10 transition-all"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 flex items-center justify-center transition-colors"
          >
            <X className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" />
          </button>
        )}
      </div>

      {/* Franchise filter — super admin only */}
      {isSuperAdmin && franchises && onFranchiseChange && (
        <Select
          value={franchiseFilter ?? "ALL"}
          onValueChange={onFranchiseChange}
        >
          <SelectTrigger className="h-9 w-44 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate min-w-0 flex-1">
                <SelectValue placeholder="All Franchises" />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26] max-w-50">
            <SelectItem
              value="ALL"
              className="text-[13px] rounded-lg px-2 py-1.5"
            >
              All Franchises
            </SelectItem>
            {franchises.map((f) => (
              <SelectItem
                key={f._id}
                value={f._id}
                className="text-[13px] rounded-lg px-2 py-1.5"
              >
                <span className="truncate block max-w-40">{f.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Outlet filter */}
      {filterableOutlets && onOutletChange && (
        <Select value={outletFilter ?? "ALL"} onValueChange={onOutletChange}>
          <SelectTrigger className="h-9 w-44 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
            <div className="flex items-center gap-2 min-w-0">
              <Store className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <SelectValue placeholder="All Outlets" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
            <SelectItem value="ALL" className="text-[13px] rounded-lg">
              All Outlets
            </SelectItem>
            {filterableOutlets.map((o) => (
              <SelectItem
                key={o._id}
                value={o._id}
                className="text-[13px] rounded-lg"
              >
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Status toggle */}
      <div className="flex gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 rounded-xl p-1">
        {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`px-3 h-7 rounded-lg text-[12px] font-semibold transition-all ${
              statusFilter === s
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            {s === "ALL" ? "All" : s === "ACTIVE" ? "Online" : "Offline"}
          </button>
        ))}
      </div>

      {/* Clear filters */}
      {hasActiveFilters && onClearFilters && (
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
