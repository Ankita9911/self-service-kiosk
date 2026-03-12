import { Search, X, AlertTriangle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";

export const UNIT_OPTIONS = [
    { value: "ALL", label: "All Units" },
    { value: "gram", label: "Gram (g)" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "ml", label: "Milliliter (ml)" },
    { value: "liter", label: "Liter (L)" },
    { value: "piece", label: "Piece (pcs)" },
    { value: "dozen", label: "Dozen (doz)" },
];

interface Props {
    searchTerm: string;
    unitFilter: string;
    lowStockOnly: boolean;
    onSearchChange: (v: string) => void;
    onUnitChange: (v: string) => void;
    onLowStockChange: (v: boolean) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export function IngredientFilters({
    searchTerm,
    unitFilter,
    lowStockOnly,
    onSearchChange,
    onUnitChange,
    onLowStockChange,
    hasActiveFilters,
    onClearFilters,
}: Props) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-52">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                    placeholder="Search by ingredient name…"
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

            {/* Unit filter */}
            <Select value={unitFilter} onValueChange={onUnitChange}>
                <SelectTrigger className="h-9 w-44 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
                    <SelectValue placeholder="All Units" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
                    {UNIT_OPTIONS.map((u) => (
                        <SelectItem key={u.value} value={u.value} className="text-[13px] rounded-lg px-2 py-1.5">
                            {u.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Low stock toggle */}
            <div className="flex gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 rounded-xl p-1">
                {([false, true] as const).map((val) => (
                    <button
                        key={String(val)}
                        onClick={() => onLowStockChange(val)}
                        className={`px-3 h-7 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 ${lowStockOnly === val
                                ? val
                                    ? "bg-red-500 text-white shadow-sm"
                                    : "bg-indigo-600 text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                            }`}
                    >
                        {val && <AlertTriangle className="w-3 h-3" />}
                        {val ? "Low Stock" : "All"}
                    </button>
                ))}
            </div>

            {/* Clear filters */}
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
