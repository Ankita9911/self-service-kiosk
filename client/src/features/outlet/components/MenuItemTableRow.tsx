import { useState, useRef, useEffect } from "react";
import {
  Pencil,
  Trash2,
  ImageOff,
  Package,
  AlertTriangle,
  MoreVertical,
  DollarSign,
  ZoomIn,
  Power,
  Eye,
  Info,
  BookOpen,
} from "lucide-react";
import type { MenuItem, Category } from "@/features/kiosk/types/menu.types";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { AdminOfferBadge } from "@/features/kiosk/components/OfferBadge";

interface Props {
  item: MenuItem;
  categories: Category[];
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onUpdatePrice: () => void;
  onUpdateStock?: () => void;
  onToggleStatus: () => void;
  onView: () => void;
  onCreateRecipe?: () => void;
}

export function MenuItemTableRow({
  item,
  categories,
  index,
  onEdit,
  onDelete,
  onUpdatePrice,
  onUpdateStock,
  onToggleStatus,
  onView,
  onCreateRecipe,
}: Props) {
  const category = categories.find((c) => c._id === item.categoryId);
  const isLowStock = item.stockStatus === "LOW_STOCK";
  const isOutOfStock = item.stockStatus === "OUT_OF_STOCK";
  const hasRecipeStock = item.stockSource === "RECIPE";
  const isUnavailable = item.isActive === false || isOutOfStock;

  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const menuActions = [
    {
      icon: Eye,
      label: "View details",
      onClick: onView,
      className:
        "text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400",
    },
    ...(item.imageUrl
      ? [
          {
            icon: ZoomIn,
            label: "View image",
            onClick: () => setPreview(true),
            className:
              "text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400",
          },
        ]
      : []),
    {
      icon: Pencil,
      label: "Edit item",
      onClick: onEdit,
      className:
        "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400",
    },
    {
      icon: DollarSign,
      label: "Update price",
      onClick: onUpdatePrice,
      className:
        "text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400",
    },
    ...(item.inventoryMode === "DIRECT" && onUpdateStock
      ? [
          {
            icon: Package,
            label: "Update direct stock",
            onClick: onUpdateStock,
            className:
              "text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400",
          },
        ]
      : []),
    ...(item.inventoryMode === "RECIPE" &&
    item.stockStatus === "NO_RECIPE" &&
    onCreateRecipe
      ? [
          {
            icon: BookOpen,
            label: "Create recipe",
            onClick: onCreateRecipe,
            className:
              "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400",
          },
        ]
      : []),
    {
      icon: Power,
      label: item.isActive !== false ? "Deactivate" : "Activate",
      onClick: onToggleStatus,
      className:
        item.isActive !== false
          ? "text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400"
          : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700",
    },
    {
      icon: Trash2,
      label: "Delete",
      onClick: onDelete,
      className:
        "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300",
    },
  ];

  return (
    <>
      <tr
        className={`group border-b border-slate-100 dark:border-white/5 transition-colors ${
          isUnavailable
            ? "opacity-55 grayscale bg-slate-50/60 dark:bg-white/1 hover:bg-slate-100/60 dark:hover:bg-white/2"
            : `hover:bg-slate-50/70 dark:hover:bg-white/2 ${
                index % 2 === 0 ? "" : "bg-slate-50/30 dark:bg-white/1"
              }`
        }`}
      >
        {/* # */}
        <td className="px-4 py-3 w-10">
          <span className="text-xs text-slate-400 dark:text-slate-600 font-mono">
            {index}
          </span>
        </td>

        {/* Thumbnail + Name */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/6 border border-slate-200 dark:border-white/7 flex items-center justify-center shrink-0 ${item.imageUrl ? "cursor-zoom-in" : ""}`}
              onClick={() => item.imageUrl && setPreview(true)}
              title={item.imageUrl ? "Click to view image" : undefined}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                />
              ) : (
                <ImageOff className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-40">
                  {item.name}
                </p>
                <button
                  type="button"
                  onClick={onView}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-white/8 transition-all shrink-0"
                  title="View details"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              {item.description && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-40 mt-0.5">
                  {item.description}
                </p>
              )}
              {item.offers && item.offers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.offers.map((offer, i) => (
                    <AdminOfferBadge key={i} offer={offer} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Category */}
        <td className="px-4 py-3">
          {category ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
              {category.name}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </td>

        {/* Price */}
        <td className="px-4 py-3">
          <span className="text-sm font-bold text-slate-800 dark:text-white">
            ₹{item.price.toFixed(0)}
          </span>
        </td>

        {/* Stock */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-400/20">
                <AlertTriangle className="w-3 h-3" />
                Out of stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-400/20">
                <Package className="w-3 h-3" />
                {item.inventoryMode === "DIRECT"
                  ? `${item.availableQuantity ?? 0} units left`
                  : `${item.availableQuantity ?? 0} servings left`}
              </span>
            ) : item.stockStatus === "NO_RECIPE" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/8">
                <BookOpen className="w-3 h-3" />
                No recipe linked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                {item.inventoryMode === "DIRECT"
                  ? `${item.availableQuantity ?? 0} units`
                  : hasRecipeStock
                    ? `${item.availableQuantity ?? 0} servings`
                    : "Available"}
              </span>
            )}
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <div className="flex flex-col items-start gap-1">
            {item.isActive !== false ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.07]">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Inactive
              </span>
            )}
            {item.serviceType && item.serviceType !== "BOTH" && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.serviceType === "DINE_IN"
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-400/20"
                    : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-400/20"
                }`}
              >
                {item.serviceType === "DINE_IN" ? "Dine In" : "Take Away"}
              </span>
            )}
          </div>
        </td>

        {/* Actions — three dots dropdown */}
        <td className="px-4 py-3 text-right">
          <div
            className="relative inline-flex items-center gap-1"
            ref={menuRef}
          >
            <button
              ref={btnRef}
              onClick={() => {
                if (btnRef.current) {
                  const rect = btnRef.current.getBoundingClientRect();
                  setOpenAbove(window.innerHeight - rect.bottom < 200);
                }
                setMenuOpen((v) => !v);
              }}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-all"
              title="Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className={`absolute right-0 ${openAbove ? "bottom-9" : "top-9"} z-50 w-44 bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/8 rounded-xl shadow-lg shadow-black/10 dark:shadow-black/40 py-1 overflow-hidden`}
              >
                {menuActions.map(
                  ({ icon: Icon, label, onClick, className }) => (
                    <button
                      key={label}
                      onClick={() => {
                        onClick();
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${className}`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {label}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </td>
      </tr>

      {preview && item.imageUrl && (
        <ImagePreviewModal
          src={item.imageUrl}
          alt={item.name}
          onClose={() => setPreview(false)}
        />
      )}
    </>
  );
}
