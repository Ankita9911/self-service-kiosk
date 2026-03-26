import { useEffect, useRef } from "react";
import { Plus, Minus, Package } from "lucide-react";
import { motion } from "framer-motion";
import { trackEvent } from "@/features/kiosk/telemetry";
import type { Combo } from "../types/menu.types";
import type { CartItem } from "../types/cartItem.types";

interface ComboGridProps {
  combos: Combo[];
  cart: CartItem[];
  onViewCombo: (combo: Combo) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
}

export default function ComboGrid({
  combos,
  cart,
  onViewCombo,
  onUpdateQuantity,
}: ComboGridProps) {
  const comboNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const seenImpressionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (combos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const comboId = entry.target.getAttribute("data-combo-id");
          if (!comboId || seenImpressionsRef.current.has(comboId)) return;

          seenImpressionsRef.current.add(comboId);
          trackEvent({
            name: "kiosk.combo_impression",
            page: "menu",
            component: "combo_grid",
            action: "impression",
            target: comboId,
          });
        });
      },
      { threshold: 0.45 },
    );

    combos.forEach((combo) => {
      const node = comboNodeRefs.current[String(combo._id)];
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [combos]);

  const handleViewCombo = (combo: Combo, source: string) => {
    trackEvent({
      name: "kiosk.combo_card_opened",
      page: "menu",
      component: "combo_grid",
      action: "open",
      target: String(combo._id),
      payload: {
        source,
      },
    });
    onViewCombo(combo);
  };

  if (combos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400">
        <div className="w-32 h-32 bg-linear-to-br from-[#ebfaf6] to-[#dff5ef] rounded-full flex items-center justify-center mb-6">
          <Package className="w-16 h-16 text-[#8ad6c8]" strokeWidth={1.5} />
        </div>
        <p
          className="text-2xl font-bold text-gray-500"
          style={{ fontFamily: "var(--font-display)" }}
        >
          No Combos Available
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {combos.map((combo) => {
        const cartItem = cart.find((c) => c.itemId === String(combo._id));
        const quantity = cartItem?.quantity ?? 0;
        const savings =
          combo.originalPrice > 0 ? combo.originalPrice - combo.comboPrice : 0;

        return (
          <motion.div
            key={String(combo._id)}
            ref={(node) => {
              comboNodeRefs.current[String(combo._id)] = node;
            }}
            data-combo-id={String(combo._id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col border-2 border-[#dcefe9] hover:border-[#bde7de] cursor-pointer"
            onClick={() => handleViewCombo(combo, "card")}
          >
            {/* Image */}
            <div className="relative h-48 bg-linear-to-br from-[#ebfaf6] via-[#e2f6f0] to-[#ebfaf6] overflow-hidden group">
              {combo.imageUrl ? (
                <>
                  <img
                    src={combo.imageUrl}
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">🍱</span>
                </div>
              )}

              {/* COMBO badge */}
              <div className="absolute top-3 left-3 bg-[#0e9f89] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                🍱 COMBO
              </div>

              {/* Savings badge */}
              {savings > 0 && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                  SAVE ₹{savings.toFixed(0)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <h3
                className="text-lg font-black text-gray-900 leading-tight mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {combo.name}
              </h3>

              {combo.description && (
                <p
                  className="text-sm text-gray-500 mb-2"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {combo.description}
                </p>
              )}

              {/* Includes */}
              {combo.items.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Includes
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {combo.items.map((ci, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-[#e8f7f3] text-[#0b8b78] border border-[#dcefe9] px-2 py-0.5 rounded-full font-semibold"
                      >
                        {ci.quantity > 1 ? `${ci.quantity}× ` : ""}
                        {ci.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  trackEvent({
                    name: "kiosk.combo_details_opened",
                    page: "menu",
                    component: "combo_grid",
                    action: "view_details",
                    target: String(combo._id),
                  });
                  handleViewCombo(combo, "view_details");
                }}
                className="self-start text-[11px] font-black text-[#0e9f89] hover:text-[#0b8b78] underline underline-offset-2"
                style={{ fontFamily: "var(--font-body)" }}
              >
                View full combo details
              </button>

              <div className="flex-1" />

              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="flex flex-col">
                  <span
                    className="text-xs font-semibold text-gray-500"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    COMBO PRICE
                  </span>
                  <div className="flex items-baseline gap-2">
                    {combo.originalPrice > 0 &&
                      combo.originalPrice > combo.comboPrice && (
                        <span
                          className="text-sm line-through text-gray-400"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          ₹{combo.originalPrice.toFixed(2)}
                        </span>
                      )}
                    <span
                      className="text-2xl font-black text-[#0e9f89]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      ₹{combo.comboPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {quantity === 0 ? (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      trackEvent({
                        name: "kiosk.combo_details_opened",
                        page: "menu",
                        component: "combo_grid",
                        action: "add_click",
                        target: String(combo._id),
                      });
                      handleViewCombo(combo, "add_button");
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 rounded-2xl font-black flex items-center justify-center shadow-lg transition-all bg-linear-to-br from-[#16b8a1] via-[#0e9f89] to-[#16b8a1] hover:from-[#0fb39a] hover:via-[#0b8b78] hover:to-[#0fb39a] text-white shadow-[#8edfd1]/45"
                  >
                    <Plus className="w-6 h-6" strokeWidth={3} />
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-xl border-2 border-[#dcefe9]">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!cartItem) return;
                        trackEvent({
                          name: "kiosk.combo_quantity_changed",
                          page: "menu",
                          component: "combo_grid",
                          action: "change_quantity",
                          target: String(combo._id),
                          payload: {
                            quantityBefore: quantity,
                            quantityAfter: Math.max(0, quantity - 1),
                          },
                        });
                        onUpdateQuantity(cartItem.cartItemId, -1);
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        trackEvent({
                          name: "kiosk.combo_details_opened",
                          page: "menu",
                          component: "combo_grid",
                          action: "change_quantity",
                          target: String(combo._id),
                          payload: {
                            quantityBefore: quantity,
                            quantityAfter: quantity + 1,
                          },
                        });
                        handleViewCombo(combo, "quantity_plus");
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-xl bg-linear-to-br from-[#16b8a1] to-[#0e9f89] hover:from-[#0fb39a] hover:to-[#0b8b78] text-white shadow-md flex items-center justify-center transition-all"
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
