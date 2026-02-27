import { useState } from "react";
import { Pencil, Trash2, ImageOff, Package, AlertTriangle } from "lucide-react";
import type { MenuItem } from "@/features/kiosk/types/menu.types";
import { ImagePreviewModal, ImageZoomButton } from "./ImagePreviewModal";

interface Props {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
}

export function MenuItemCard({ item, onEdit, onDelete }: Props) {
  const isLowStock = item.stockQuantity > 0 && item.stockQuantity <= 5;
  const isOutOfStock = item.stockQuantity === 0;
  const [preview, setPreview] = useState(false);

  return (
    <>
    <div className="group relative bg-white dark:bg-[#1e2130] rounded-2xl border border-slate-100 dark:border-white/[0.07] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200">
      {/* Image area */}
      <div className="relative aspect-4/3 bg-slate-100 dark:bg-white/4">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* status badge */}
        {item.isActive === false && (
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/70 text-white backdrop-blur-sm">
              Inactive
            </span>
          </div>
        )}

        {/* hover actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
          {item.imageUrl && (
            <ImageZoomButton onClick={(e) => { e.stopPropagation(); setPreview(true); }} />
          )}
          <button
            onClick={onEdit}
            className="h-7 w-7 rounded-xl bg-white/90 dark:bg-[#1e2130]/90 backdrop-blur-sm border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="h-7 w-7 rounded-xl bg-white/90 dark:bg-[#1e2130]/90 backdrop-blur-sm border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 shadow-sm transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white shadow">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{item.name}</p>
        {item.description && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
            ₹{item.price.toFixed(0)}
          </span>

          <div className={`flex items-center gap-1 text-[11px] font-semibold ${
            isOutOfStock
              ? "text-red-500 dark:text-red-400"
              : isLowStock
                ? "text-amber-500 dark:text-amber-400"
                : "text-slate-400 dark:text-slate-500"
          }`}>
            {isLowStock && !isOutOfStock && <AlertTriangle className="w-3 h-3" />}
            {!isLowStock && !isOutOfStock && <Package className="w-3 h-3" />}
            {isOutOfStock ? "No stock" : `${item.stockQuantity} in stock`}
          </div>
        </div>
      </div>
    </div>

      {preview && item.imageUrl && (
        <ImagePreviewModal src={item.imageUrl} alt={item.name} onClose={() => setPreview(false)} />
      )}
    </>
  );
}