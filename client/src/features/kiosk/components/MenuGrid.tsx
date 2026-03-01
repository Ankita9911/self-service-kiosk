import { Plus, ImageOff, Minus, AlertCircle, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { MenuItem } from "../../../shared/lib/menuCache";
import type { CartItem } from "../types/cartItem.types";
import { OfferBadge } from "./OfferBadge";

const DESC_LIMIT = 70;

function DescriptionText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (text.length <= DESC_LIMIT) {
    return <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-body)" }}>{text}</p>;
  }
  return (
    <div>
      <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-body)" }}>
        {expanded ? text : `${text.slice(0, DESC_LIMIT)}…`}
      </p>
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-bold text-orange-500 hover:text-orange-600 transition-colors"
      >
        {expanded ? "Show less" : "Read more"}
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}

interface MenuGridProps {
  items: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
}

export default function MenuGrid({
  items,
  cart,
  onAddToCart,
  onUpdateQuantity,
}: MenuGridProps) {
  const availableItems = items.filter((item) => item.stockQuantity > 0);

  if (availableItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400">
        <div className="w-32 h-32 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
          <ImageOff className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
        </div>
        <p
          className="text-2xl font-bold text-gray-500"
          style={{ fontFamily: "var(--font-display)" }}
        >
          No Items Available
        </p>
        <p
          className="text-gray-400 mt-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Check back soon for updates
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {availableItems.map((item) => {
        const cartItem = cart.find((c) => c.itemId === item._id);
        const quantity = cartItem?.quantity || 0;
        const remainingStock = item.stockQuantity - quantity;
        const isLowStock = remainingStock <= 3 && remainingStock > 0;
        const isOutOfStock = remainingStock === 0;
        const isAtMaxStock = quantity >= item.stockQuantity;

        return (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full border-2 ${
              isOutOfStock
                ? "border-gray-200 opacity-60"
                : "border-white hover:border-orange-200"
            }`}
          >
            <div className="relative h-48 bg-linear-to-br from-orange-50 via-amber-50 to-orange-50 overflow-hidden group">
              {item.imageUrl ? (
                <>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff
                    className="w-16 h-16 text-gray-300"
                    strokeWidth={1.5}
                  />
                </div>
              )}

              {isLowStock && (
                <div className="absolute top-3 right-3 bg-linear-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span
                    className="text-xs font-black"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    LOW STOCK
                  </span>
                </div>
              )}

              {/* Offer badges – top left */}
              {(item as any).offers && (item as any).offers.length > 0 && (
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {(item as any).offers.map((offer: any, idx: number) => (
                    <OfferBadge key={idx} offer={offer} />
                  ))}
                </div>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-white text-gray-900 px-6 py-3 rounded-full shadow-xl">
                    <span
                      className="text-sm font-black"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      OUT OF STOCK
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h3
                className="text-lg font-black text-gray-900 leading-tight mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.name}
              </h3>

              {item.description && (
                <div className="mb-2">
                  <DescriptionText text={item.description} />
                </div>
              )}

              <div className="flex-1" />

              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="flex flex-col">
                  <span
                    className="text-xs font-semibold text-gray-500"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    PRICE
                  </span>
                  {(item as any).offers?.find((o: any) => o.type === "DISCOUNT" && o.discountPercent) ? (
                    <div className="flex flex-col">
                      <span className="text-sm line-through text-gray-400" style={{ fontFamily: "var(--font-display)" }}>
                        ₹{item.price.toFixed(2)}
                      </span>
                      <span className="text-2xl font-black text-red-500" style={{ fontFamily: "var(--font-display)" }}>
                        ₹{(item.price * (1 - (item as any).offers.find((o: any) => o.type === "DISCOUNT").discountPercent / 100)).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span
                      className="text-2xl font-black bg-linear-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      ₹{item.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {quantity === 0 ? (
                  <motion.button
                    onClick={() => !isOutOfStock && onAddToCart(item)}
                    disabled={isOutOfStock}
                    whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
                    whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
                    className={`p-4 rounded-2xl font-black flex items-center justify-center shadow-lg transition-all ${
                      isOutOfStock
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-linear-to-br from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 text-white shadow-orange-300"
                    }`}
                  >
                    <Plus className="w-6 h-6" strokeWidth={3} />
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-xl border-2 border-orange-100">
                    <motion.button
                      onClick={() => onUpdateQuantity(item._id, -1)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all"
                    >
                      <Minus className="w-4 h-4" strokeWidth={2.5} />
                    </motion.button>

                    <span
                      className="text-xl font-black text-gray-900 min-w-10 text-center"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {quantity}
                    </span>

                    <motion.button
                      onClick={() => !isAtMaxStock && onAddToCart(item)}
                      disabled={isAtMaxStock}
                      whileHover={{ scale: isAtMaxStock ? 1 : 1.1 }}
                      whileTap={{ scale: isAtMaxStock ? 1 : 0.9 }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isAtMaxStock
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-linear-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
                      }`}
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
