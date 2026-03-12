import { X, ImageOff, Package, AlertTriangle, Tag, BookOpen } from "lucide-react";
import type { MenuItem, Category } from "@/features/kiosk/types/menu.types";

interface Props {
  item: MenuItem;
  categories: Category[];
  onClose: () => void;
}

export function ItemViewModal({ item, categories, onClose }: Props) {
  const category = categories.find((c) => c._id === item.categoryId);
  const isLowStock = item.stockStatus === "LOW_STOCK";
  const isOutOfStock = item.stockStatus === "OUT_OF_STOCK";
  const isActive = item.isActive !== false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* top accent bar */}
        <div className="h-0.5 bg-linear-to-r from-indigo-400 via-indigo-500 to-violet-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/8">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Item Details</h3>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image */}
        <div className="relative aspect-video bg-slate-100 dark:bg-white/4">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
          )}

          {/* status overlay badge */}
          {!isActive && (
            <div className="absolute top-2 left-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 text-white backdrop-blur-sm">
                Inactive
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Name + price */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {item.name}
              </h4>
              {category && (
                <div className="flex items-center gap-1 mt-1">
                  <Tag className="w-3 h-3 text-indigo-500" />
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    {category.name}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 shrink-0">
              ₹{item.price.toFixed(0)}
            </span>
          </div>

          {/* Description */}
          {item.description ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.description}
            </p>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-600 italic">No description provided.</p>
          )}

          {/* Stock + Status pills */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {/* Stock */}
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-400/20">
                <AlertTriangle className="w-3 h-3" /> Out of stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-400/20">
                <Package className="w-3 h-3" /> {item.inventoryMode === "DIRECT" ? `${item.availableQuantity ?? 0} units left` : `${item.availableQuantity ?? 0} servings left`}
              </span>
            ) : item.stockStatus === "NO_RECIPE" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/8">
                <BookOpen className="w-3 h-3" /> No recipe linked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/8">
                <Package className="w-3 h-3" /> {item.inventoryMode === "DIRECT" ? `${item.availableQuantity ?? 0} units available` : `${item.availableQuantity ?? 0} servings available`}
              </span>
            )}

            {/* Active/Inactive */}
            {isActive ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/8">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Inactive
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
