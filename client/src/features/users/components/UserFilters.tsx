import { Search, Building2, Store, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Combobox } from "@/shared/components/ui/combobox";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";

const ALL_ROLES = [
  { value: "ALL",             label: "All Roles" },
  { value: "FRANCHISE_ADMIN", label: "Franchise Admin" },
  { value: "OUTLET_MANAGER",  label: "Outlet Manager" },
  { value: "KITCHEN_STAFF",   label: "Kitchen Staff" },
  { value: "PICKUP_STAFF",    label: "Pickup Staff" },
];

const STATUS_OPTIONS = ["ALL", "ACTIVE", "INACTIVE"] as const;

interface UserFiltersProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter: "ALL" | "ACTIVE" | "INACTIVE";
  franchiseFilter: string;
  outletFilter: string;
  franchises: Franchise[];
  outlets: Outlet[];
  isSuperAdmin: boolean;
  isFranchiseAdmin: boolean;
  isFiltered: boolean;
  onSearchChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onStatusChange: (v: "ALL" | "ACTIVE" | "INACTIVE") => void;
  onFranchiseChange: (v: string) => void;
  onOutletChange: (v: string) => void;
  onClearFilters: () => void;
  onResetPage: () => void;
}

export function UserFilters({
  searchTerm,
  roleFilter,
  statusFilter,
  franchiseFilter,
  outletFilter,
  franchises,
  outlets,
  isSuperAdmin,
  isFranchiseAdmin,
  isFiltered,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onFranchiseChange,
  onOutletChange,
  onClearFilters,
  onResetPage,
}: UserFiltersProps) {
  const franchiseOptions = [
    { value: "ALL", label: "All Franchises" },
    ...franchises.map((f) => ({ value: f._id, label: f.name })),
  ];

  const outletOptions = [
    { value: "ALL", label: "All Outlets" },
    ...outlets.map((o) => ({ value: o._id, label: o.name })),
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div className="relative flex-1 min-w-52">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          placeholder="Search by name or email…"
          className="w-full h-9 pl-9 pr-3.5 rounded-xl bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 text-[13px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-400/15 dark:focus:ring-indigo-500/10 transition-all"
          value={searchTerm}
          onChange={(e) => { onSearchChange(e.target.value); onResetPage(); }}
        />
      </div>

      {isSuperAdmin && (
        <Combobox
          value={franchiseFilter}
          onValueChange={(v) => { onFranchiseChange(v); onResetPage(); }}
          options={franchiseOptions}
          placeholder="All Franchises"
          searchPlaceholder="Search franchises…"
          emptyText="No franchises found"
          icon={<Building2 className="w-3.5 h-3.5" />}
          className="w-44"
        />
      )}

      {(isSuperAdmin || isFranchiseAdmin) && (
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

      <Select
        value={roleFilter}
        onValueChange={(v) => { onRoleChange(v); onResetPage(); }}
      >
        <SelectTrigger className="h-9 w-40 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
          {ALL_ROLES.map((r) => (
            <SelectItem key={r.value} value={r.value} className="text-[13px] rounded-lg">
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 rounded-xl p-1">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`px-3 h-7 rounded-lg text-[12px] font-semibold transition-all ${
              statusFilter === s
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Inactive"}
          </button>
        ))}
      </div>

      {isFiltered && (
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
