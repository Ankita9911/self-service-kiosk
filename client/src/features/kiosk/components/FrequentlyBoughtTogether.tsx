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
    <div className="border-t border-[#dff1ec] pt-3 pb-2 bg-[#fcfffe]">
      <div className="mx-auto w-full max-w-5xl px-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 bg-[#e8f7f3] px-3 py-1 rounded-full">
            <Users className="w-3.5 h-3.5 text-[#0e9f89]" strokeWidth={2.5} />
            <span
              className="text-xs font-black text-[#0e9f89] uppercase tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Often ordered together
            </span>
          </div>
          {isLoading && (
            <Loader2 className="w-3 h-3 text-[#67c7b7] animate-spin ml-auto" />
          )}
          <div className="h-px flex-1 bg-linear-to-r from-[#bce9de] to-transparent" />
        </div>

        {/* Items */}
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            // Skeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={`fbt-skel-${i}`}
                  className="p-3 rounded-xl bg-[#f2faf8] border border-[#e0f2ed] animate-pulse"
                >
                  <div className="w-full h-20 rounded-lg bg-gray-200 mb-2" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-gray-200 rounded-full w-3/4" />
                    <div className="h-2 bg-gray-200 rounded-full w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {items.map((item, index) => {
                const alreadyInCart = cart.some(
                  (c) => c.itemId === String(item._id),
                );
                const discountOffer = (item.offers ?? []).find(
                  (o) => o.type === "DISCOUNT" && o.discountPercent,
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
                    className={`rounded-xl border transition-all p-2.5 ${
                      alreadyInCart
                        ? "bg-[#e9f8f4] border-[#bde7de]"
                        : "bg-white border-[#e0f2ed] hover:border-[#bde7de] hover:bg-[#f4fbf9]"
                    }`}
                  >
                    <div className="w-full h-24 rounded-lg overflow-hidden bg-[#e8f7f3]">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff
                            className="w-4 h-4 text-gray-300"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-2 min-w-0">
                      <p
                        className="text-xs font-bold text-gray-900 truncate leading-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="text-xs font-semibold text-[#0e9f89] mt-0.5"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        ₹{effectivePrice.toFixed(0)}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      {alreadyInCart ? (
                        <span className="text-[10px] font-black text-[#0e9f89] bg-[#e8f7f3] px-2 py-1 rounded-lg border border-[#cdebe4]">
                          ✓ Added
                        </span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            onAddToCart(item as unknown as MenuItem)
                          }
                          className="h-8 rounded-lg bg-[#0e9f89] hover:bg-[#0b8b78] text-white flex items-center justify-center shadow-sm transition-colors px-3 text-[11px] font-black"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={3} />
                          Add
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
