import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Plus, ImageOff, Tag } from "lucide-react";
import type { CompleteMealResult } from "../services/recommendation.service";
import type { CartItem } from "../types/cartItem.types";
import type { MenuItem } from "../types/menu.types";

interface CompleteMealSuggestionProps {
  result: CompleteMealResult;
  isLoading: boolean;
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onAddComboToCart: (combo: {
    _id: string;
    name: string;
    comboPrice: number;
  }) => void;
}

export default function CompleteMealSuggestion({
  result,
  isLoading,
  cart,
  onAddToCart,
  onAddComboToCart,
}: CompleteMealSuggestionProps) {
  const { suggestions, comboDeal } = result;
  const hasContent = suggestions.length > 0 || comboDeal !== null;

  if (!isLoading && !hasContent) return null;

  return (
    <div className="border-t border-gray-100 pt-3 px-4 pb-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <UtensilsCrossed
          className="w-3.5 h-3.5 text-purple-500"
          strokeWidth={2.5}
        />
        <span
          className="text-xs font-black text-gray-700 uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Complete your meal
        </span>
      </div>

      <AnimatePresence>
        {/* Combo deal highlight — shown first if available */}
        {comboDeal && (
          <motion.div
            key="combo-deal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 p-3"
          >
            <div className="flex items-start gap-2 mb-2">
              <Tag
                className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0"
                strokeWidth={2.5}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-black text-orange-700 leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Better deal available!
                </p>
                <p
                  className="text-[11px] text-orange-600 font-semibold mt-0.5 truncate"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {comboDeal.name}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                {comboDeal.originalPrice > comboDeal.comboPrice && (
                  <span className="text-xs line-through text-gray-400">
                    ₹{comboDeal.originalPrice.toFixed(0)}
                  </span>
                )}
                <span
                  className="text-base font-black text-orange-600"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ₹{comboDeal.comboPrice.toFixed(0)}
                </span>
                {comboDeal.originalPrice > comboDeal.comboPrice && (
                  <span className="text-[9px] font-black text-white bg-emerald-500 px-1.5 py-0.5 rounded-full">
                    SAVE ₹
                    {(comboDeal.originalPrice - comboDeal.comboPrice).toFixed(
                      0,
                    )}
                  </span>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  onAddComboToCart({
                    _id: String(comboDeal._id),
                    name: comboDeal.name,
                    comboPrice: comboDeal.comboPrice,
                  })
                }
                className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-sm transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <Plus className="w-3 h-3" strokeWidth={3} />
                Add Combo
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Category gap suggestions */}
        {suggestions.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((item, index) => {
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.07, duration: 0.2 }}
                  className={`rounded-xl overflow-hidden border transition-all ${
                    alreadyInCart
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-gray-100 bg-white hover:border-orange-200"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="h-16 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff
                          className="w-6 h-6 text-gray-300"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info + add */}
                  <div className="p-2">
                    <p
                      className="text-[11px] font-bold text-gray-900 truncate leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span
                        className="text-xs font-black text-orange-600"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        ₹{effectivePrice.toFixed(0)}
                      </span>
                      {alreadyInCart ? (
                        <span className="text-[9px] font-black text-emerald-600">
                          ✓
                        </span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            onAddToCart(item as unknown as MenuItem)
                          }
                          className="w-6 h-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-sm transition-colors"
                        >
                          <Plus className="w-3 h-3" strokeWidth={3} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
