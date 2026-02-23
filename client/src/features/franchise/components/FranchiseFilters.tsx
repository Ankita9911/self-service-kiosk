import { Search, X } from "lucide-react";
import { cn } from "@/shared/utils/commonFunction";

interface Props {
  searchTerm: string;
  statusFilter: "ALL" | "ACTIVE" | "INACTIVE";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "ALL" | "ACTIVE" | "INACTIVE") => void;
}

export function FranchiseFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <input
          type="text"
          placeholder="Search by name, code or email…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-11 pr-10 rounded-xl border border-slate-200 bg-white text-sm font-satoshi text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15 transition-all shadow-sm"
        />

        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 text-slate-500" />
          </button>
        )}
      </div>

      <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
        {(["ALL", "ACTIVE", "INACTIVE"] as const).map(s => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={cn(
              "px-3 h-8 rounded-lg text-[12px] font-clash-semibold transition-all",
              statusFilter === s
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Inactive"}
          </button>
        ))}
      </div>
    </div>
  );
}