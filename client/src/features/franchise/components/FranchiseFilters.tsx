import { Search, X } from "lucide-react";

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
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, code or email…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full h-9 pl-9 pr-9 rounded-xl
            bg-white dark:bg-[#161920]
            border border-slate-100 dark:border-white/[0.08]
            text-[13px] text-slate-700 dark:text-slate-200
            placeholder:text-slate-400 dark:placeholder:text-slate-600
            focus:outline-none
            focus:border-indigo-400 dark:focus:border-indigo-500/60
            focus:ring-2 focus:ring-indigo-400/15 dark:focus:ring-indigo-500/10
            transition-all
          "
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-slate-200 dark:bg-white/[0.1] hover:bg-slate-300 dark:hover:bg-white/[0.15] flex items-center justify-center transition-colors"
          >
            <X className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" />
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/[0.08] rounded-xl p-1">
        {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`
              px-3 h-7 rounded-lg text-[12px] font-semibold transition-all
              ${statusFilter === s
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
              }
            `}
          >
            {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Inactive"}
          </button>
        ))}
      </div>
    </div>
  );
}