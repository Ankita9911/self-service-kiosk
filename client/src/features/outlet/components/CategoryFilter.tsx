import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, Check, Trash2, X, Pencil } from "lucide-react";

interface Props {
  categories: { _id: string; name: string; imageUrl?: string; description?: string }[];
  selectedCategoryId: string;
  onSelect: (id: string) => void;
  onEditCategory?: (category: { _id: string; name: string; imageUrl?: string; description?: string }) => void;
  onDeleteCategory?: (id: string) => void;
}

export function CategoryFilter({ categories, selectedCategoryId, onSelect, onEditCategory, onDeleteCategory }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  // which category IDs are shown as tabs (default: all)
  const [visibleIds, setVisibleIds] = useState<string[]>(() =>
    categories.map((c) => c._id)
  );

  // keep visibleIds in sync if categories list changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleIds((prev) => {
      const valid = prev.filter((id) => categories.some((c) => c._id === id));
      return valid.length > 0 ? valid : categories.map((c) => c._id);
    });
  }, [categories]);

  // close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleId = (id: string) =>
    setVisibleIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );

  const visibleCategories = categories.filter((c) => visibleIds.includes(c._id));
  const tabItems = [{ _id: "ALL", name: "All Items" }, ...visibleCategories];

  const allSelected = visibleIds.length === categories.length;

  return (
    <div className="flex items-center gap-2 min-w-0">
      {/* ── tab strip — naturally sized, scrolls on overflow ── */}
      <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 rounded-xl p-1">
              {tabItems.map((c) => (
            <button
              key={c._id}
              onClick={() => onSelect(c._id)}
              className={`px-3.5 h-7 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategoryId === c._id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {c._id !== "ALL" && categories.find((cat) => cat._id === c._id)?.imageUrl ? (
                  <img
                    src={categories.find((cat) => cat._id === c._id)?.imageUrl}
                    alt={c.name}
                    className="w-4 h-4 rounded-md object-cover"
                  />
                ) : null}
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── multiselect dropdown ── */}
      {categories.length > 0 && (
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
              open
                ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400"
                : "bg-white dark:bg-[#161920] border-slate-200 dark:border-white/8 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Categories</span>
            {!allSelected && (
              <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-1.5 rounded-md leading-4">
                {visibleIds.length}/{categories.length}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute top-full right-0 mt-1.5 w-52 bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/[0.07] rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden">
              {/* header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-white/[0.07]">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Show in filter
                </span>
                <button
                  onClick={() =>
                    setVisibleIds(allSelected ? [] : categories.map((c) => c._id))
                  }
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {allSelected ? "Clear all" : "Select all"}
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto p-1">
                {categories.map((c) => {
                  const checked = visibleIds.includes(c._id);
                  const isPending = pendingDelete === c._id;
                  return (
                    <div
                      key={c._id}
                      className="flex items-center gap-1 px-1 py-0.5 rounded-lg group"
                    >
                      {/* checkbox row */}
                      <button
                        onClick={() => { setPendingDelete(null); toggleId(c._id); }}
                        className="flex items-center gap-2.5 flex-1 px-1.5 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div
                          className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            checked
                              ? "bg-indigo-600 border-indigo-600"
                              : "border-slate-200 dark:border-white/15 group-hover:border-indigo-400"
                          }`}
                        >
                          {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <span
                          className={`text-xs font-medium text-left flex-1 truncate ${
                            checked ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {c.name}
                        </span>
                      </button>

                      {/* delete action */}
                      {(onEditCategory || onDeleteCategory) && (
                        isPending ? (
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => { onDeleteCategory(c._id); setPendingDelete(null); }}
                              className="h-6 w-6 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                              title="Confirm delete"
                            >
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </button>
                            <button
                              onClick={() => setPendingDelete(null)}
                              className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                            {onEditCategory && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPendingDelete(null);
                                  onEditCategory(c);
                                }}
                                className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                                title="Edit category"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            )}
                            {onDeleteCategory && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setPendingDelete(c._id); }}
                                className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-red-500! hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                title="Delete category"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
