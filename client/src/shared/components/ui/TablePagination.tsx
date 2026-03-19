import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface Props {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}

export function TablePagination({ total, page, pageSize, onPageChange, onPageSizeChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function getPages(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#161920] rounded-b-2xl gap-4">
      {/* Left: count + rows-per-page */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-slate-400 dark:text-slate-500 tabular-nums whitespace-nowrap">
          {total === 0
            ? "No results"
            : `${from}–${to} of ${total}`}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap hidden sm:block">
            Rows
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-7 w-14 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-[12px] font-medium text-slate-600 dark:text-slate-300 px-2 focus:ring-1 focus:ring-indigo-400/40 focus:border-indigo-300 dark:focus:border-indigo-500/40 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((s) => (
                <SelectItem key={s} value={String(s)} className="text-[12px]">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: page controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {getPages().map((p, i) =>
          p === "…" ? (
            <span
              key={`el-${i}`}
              className="h-7 w-7 flex items-center justify-center text-slate-400 dark:text-slate-600 text-[12px] select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "h-7 w-7 rounded-lg text-[12px] font-medium transition-all",
                page === p
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}