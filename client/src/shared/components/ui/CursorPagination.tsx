import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  total: number;
  page: number;
  pageSize: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (size: number) => void;
  showPageSize?: boolean;
};

export function CursorPagination({
  total,
  page,
  pageSize,
  hasPrevPage,
  hasNextPage,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
  showPageSize = true,
}: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-white/7">
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing <b>{from}</b> to <b>{to}</b> of <b>{total}</b>
        </span>
        {showPageSize && (
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded-lg border border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920] px-2 text-xs"
            >
              {[6, 12, 24, 48].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrevPage}
          disabled={!hasPrevPage}
          className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920] text-slate-500 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 min-w-14 text-center">
          Page {page}
        </span>
        <button
          onClick={onNextPage}
          disabled={!hasNextPage}
          className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920] text-slate-500 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
