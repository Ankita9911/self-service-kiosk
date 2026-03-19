import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface Props {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}

export function GridPagination({ total, page, pageSize, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function getPages(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3)
      return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  }

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {/* count label */}
      <p className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
        Showing {from}–{to} of <span className="font-semibold text-slate-600 dark:text-slate-400">{total}</span> items
      </p>

      {/* pill page controls */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/8 rounded-2xl px-2 py-1.5 shadow-sm">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPages().map((p, i) =>
          p === "…" ? (
            <span
              key={`el-${i}`}
              className="h-8 w-8 flex items-center justify-center text-slate-400 dark:text-slate-500 text-[12px] select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "h-8 w-8 rounded-xl text-[13px] font-semibold transition-all",
                page === p
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
