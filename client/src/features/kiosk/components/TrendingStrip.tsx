import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, ImageOff } from "lucide-react";
import { trackEvent } from "@/features/kiosk/telemetry";
import type { RecommendedItem } from "../services/recommendation.service";
import type { CartItem } from "../types/cartItem.types";
import type { MenuItem } from "../types/menu.types";

interface TrendingStripProps {
  items: RecommendedItem[];
  isLoading: boolean;
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
}

function TrendingCardSkeleton() {
  return (
    <div className="shrink-0 w-48 bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-[#deefea] animate-pulse">
      <div className="h-48 bg-[#edf8f5]" />
      <div className="p-5 space-y-2">
        <div className="h-3 bg-[#edf8f5] rounded-full w-4/5" />
        <div className="h-3 bg-[#edf8f5] rounded-full w-2/5" />
      </div>
    </div>
  );
}

export default function TrendingStrip({
  items,
  isLoading,
  cart,
  onAddToCart,
}: TrendingStripProps) {
  const hasTrackedImpressionRef = useRef(false);

  useEffect(() => {
    if (isLoading || items.length === 0 || hasTrackedImpressionRef.current) return;
    hasTrackedImpressionRef.current = true;
    trackEvent({
      name: "kiosk.trending_impression",
      page: "menu",
      component: "trending_strip",
      action: "impression",
      payload: {
        itemCount: items.length,
      },
    });
  }, [isLoading, items]);

  if (!isLoading && items.length === 0) return null;

  return (
    <div className="bg-white/95 border-b border-[#dff1ec] px-6 py-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 bg-[#e7f8f4] px-3 py-1 rounded-full">
          <Flame className="w-3.5 h-3.5 text-[#0e9f89]" strokeWidth={2.5} />
          <span
            className="text-xs font-black text-[#0e9f89] tracking-wide uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Trending Now
          </span>
        </div>
        <div className="h-px flex-1 bg-linear-to-r from-[#bce9de] to-transparent" />
      </div>

      {/* Scrollable strip */}
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        <AnimatePresence mode="popLayout">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TrendingCardSkeleton key={`skel-${i}`} />
              ))
            : items.map((item, index) => {
                const inCart = cart.some((c) => c.itemId === String(item._id));
                const cartQty = cart
                  .filter((c) => c.itemId === String(item._id))
                  .reduce((sum, c) => sum + c.quantity, 0);

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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="shrink-0 w-48 bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border-2 border-[#e0f2ed] hover:border-[#bce9de] transition-all cursor-pointer group"
                    onClick={() => {
                      trackEvent({
                        name: "kiosk.trending_added",
                        page: "menu",
                        component: "trending_strip",
                        action: "add",
                        target: String(item._id),
                      });
                      onAddToCart(item as unknown as MenuItem);
                    }}
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-linear-to-br from-[#ecfaf6] to-[#dff5ef] overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff
                            className="w-8 h-8 text-gray-300"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}

                      {/* Rank badge */}
                      {index < 3 && (
                        <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-[#0e9f89] rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-[9px] font-black text-white">
                            {index + 1}
                          </span>
                        </div>
                      )}

                      {/* In-cart indicator */}
                      {inCart && (
                        <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                          ×{cartQty}
                        </div>
                      )}

                      {/* Add overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="w-8 h-8 bg-[#0e9f89] rounded-full flex items-center justify-center shadow-lg">
                          <Plus
                            className="w-4 h-4 text-white"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <p
                        className="text-xs font-bold text-gray-900 leading-tight truncate mb-1"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-black text-[#0e9f89]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          ₹{effectivePrice.toFixed(0)}
                        </span>
                        {item.totalSold && (
                          <span className="text-[9px] font-bold text-gray-400 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 text-[#3cb9a4]" />
                            {item.totalSold}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </AnimatePresence>
      </div>
    </div>
  );
}
