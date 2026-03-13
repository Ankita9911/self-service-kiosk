import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, ImageOff, Loader2 } from "lucide-react";
import type { RecommendedItem } from "../services/recommendation.service";
import type { CartItem } from "../types/cartItem.types";
import type { MenuItem } from "../types/menu.types";

interface FrequentlyBoughtTogetherProps {
  items: RecommendedItem[];
  isLoading: boolean;
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
}

export default function FrequentlyBoughtTogether({
  items,
  isLoading,
  cart,
  onAddToCart,
}: FrequentlyBoughtTogetherProps) {
  // Only show when cart has items and we have results (or are loading)
  if (!isLoading && items.length === 0) return null;

  return (
    <div className="border-t border-gray-100 pt-3 pb-1 px-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-3.5 h-3.5 text-blue-500" strokeWidth={2.5} />
        <span
          className="text-xs font-black text-gray-700 uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Often ordered together
        </span>
        {isLoading && (
          <Loader2 className="w-3 h-3 text-gray-400 animate-spin ml-auto" />
        )}
      </div>

      {/* Items */}
      <AnimatePresence mode="popLayout">
        {isLoading ? (
          // Skeleton
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={`fbt-skel-${i}`}
                className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 animate-pulse"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-gray-200 rounded-full w-3/4" />
                  <div className="h-2 bg-gray-200 rounded-full w-1/3" />
                </div>
                <div className="w-7 h-7 rounded-lg bg-gray-200 flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => {
              const alreadyInCart = cart.some((c) => c.itemId === String(item._id));
              const discountOffer = (item.offers ?? []).find(
                (o) => o.type === "DISCOUNT" && o.discountPercent
              );
              const effectivePrice = discountOffer?.discountPercent
                ? item.price * (1 - discountOffer.discountPercent / 100)
                : item.price;

              return (
                <motion.div
                  key={String(item._id)}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.25 }}
                  className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                    alreadyInCart
                      ? "bg-emerald-50 border-emerald-100"
                      : "bg-gray-50 border-transparent hover:border-orange-100 hover:bg-orange-50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-4 h-4 text-gray-300" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Name + Price */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-bold text-gray-900 truncate leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="text-xs font-semibold text-orange-600 mt-0.5"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      ₹{effectivePrice.toFixed(0)}
                    </p>
                  </div>

                  {/* Add button */}
                  {alreadyInCart ? (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg flex-shrink-0">
                      ✓ Added
                    </span>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onAddToCart(item as unknown as MenuItem)}
                      className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-sm transition-colors flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
