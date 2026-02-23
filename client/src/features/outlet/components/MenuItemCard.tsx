import { Pencil, Trash2, ImageOff, Package } from "lucide-react";
import { ImageWithFallback } from "@/shared/utils/ImageWithFallback";
import type { MenuItem } from "@/features/kiosk/types/menu.types";

interface Props {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
}

export function MenuItemCard({ item, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="aspect-square bg-slate-100 relative">
        {item.imageUrl ? (
          <ImageWithFallback
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-12 h-12 text-slate-300" />
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-orange-600 shadow"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDelete}
            className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-red-500 shadow"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
        {item.description && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-orange-600">₹{item.price}</span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Package className="w-3 h-3" />
            {item.stockQuantity} in stock
          </span>
        </div>
      </div>
    </div>
  );
}