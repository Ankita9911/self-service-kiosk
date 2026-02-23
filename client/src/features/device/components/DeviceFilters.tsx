import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

interface Props {
  searchTerm: string;
  statusFilter: "ALL" | "ACTIVE" | "INACTIVE";
  onSearchChange: (v: string) => void;
  onStatusChange: (v: "ALL" | "ACTIVE" | "INACTIVE") => void;
}

export function DeviceFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by device ID or name…"
          className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        {(["ALL", "ACTIVE", "INACTIVE"] as const).map(s => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`px-3 h-10 rounded-xl text-xs font-clash-semibold transition-all ${
              statusFilter === s
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {s === "ALL" ? "All" : s === "ACTIVE" ? "Online" : "Offline"}
          </button>
        ))}
      </div>
    </div>
  );
}