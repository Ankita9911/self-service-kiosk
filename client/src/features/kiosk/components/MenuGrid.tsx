import { Plus, ImageOff, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/features/kiosk/telemetry";
import type { MenuItem } from "../types/menu.types";
import type { CartItem } from "../types/cartItem.types";
import { OfferBadge } from "./OfferBadge";
import CustomizeItemDialouge from "./CustomizeItemDialouge";

const DESC_LIMIT = 70;
const IMPRESSION_THRESHOLD = 0.45;

function DescriptionText({ itemId, text }: { itemId: string; text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (text.length <= DESC_LIMIT) {
    return (
      <p
        className="text-sm text-gray-500"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {text}
      </p>
    );
  }
  return (
    <div>
      <p
        className="text-sm text-gray-500"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {expanded ? text : `${text.slice(0, DESC_LIMIT)}…`}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const nextExpanded = !expanded;
          trackEvent({
            name: "kiosk.menu_item_description_toggled",
            page: "menu",
            component: "menu_grid",
            action: "toggle_description",
            target: itemId,
            payload: {
              expanded: nextExpanded,
            },
          });
          setExpanded(nextExpanded);
        }}
        className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-bold text-[#0e9f89] hover:text-[#0b8b78] transition-colors"
      >
        {expanded ? "Show less" : "Read more"}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}

interface MenuGridProps {
  items: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
}

export default function MenuGrid({
  items,
  cart,
  onAddToCart,
  onUpdateQuantity,
}: MenuGridProps) {
  const [customizationItem, setCustomizationItem] = useState<MenuItem | null>(
    null,
  );
  const itemNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const seenImpressionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const itemId = entry.target.getAttribute("data-item-id");
          if (!itemId || seenImpressionsRef.current.has(itemId)) return;

          seenImpressionsRef.current.add(itemId);
          trackEvent({
            name: "kiosk.menu_item_impression",
            page: "menu",
            component: "menu_grid",
            action: "impression",
            target: itemId,
          });
        });
      },
      { threshold: IMPRESSION_THRESHOLD },
    );

    items.forEach((item) => {
      const node = itemNodeRefs.current[String(item._id)];
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [items]);

  const openCustomization = (item: MenuItem, source: string) => {
    if (item.stockQuantity <= 0) {
      trackEvent({
        name: "kiosk.menu_item_out_of_stock_attempted",
        page: "menu",
        component: "menu_grid",
        action: "blocked",
        target: String(item._id),
        payload: {
          source,
        },
      });
      return;
    }

    trackEvent({
      name: "kiosk.menu_item_opened",
      page: "menu",
      component: "menu_grid",
      action: "open",
      target: String(item._id),
      payload: {
        source,
      },
    });
    setCustomizationItem(item);
  };

  if (items.length === 0) {
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const offers = item.offers || [];
          const discountOffer = offers.find(
            (offer) =>
              offer.type === "DISCOUNT" &&
              typeof offer.discountPercent === "number",
          );
          const cartLines = cart.filter((c) => c.itemId === item._id);
          const quantity = cartLines.reduce(
            (sum, line) => sum + line.quantity,
            0,
          );
          const remainingStock = item.stockQuantity - quantity;
          const isOutOfStock = remainingStock === 0;
          const isAtMaxStock = quantity >= item.stockQuantity;
          const visibleOffers = offers.slice(0, 2);
          const hiddenOffersCount = Math.max(
            0,
            offers.length - visibleOffers.length,
          );

          return (
            <motion.div
              key={item._id}
              ref={(node) => {
                itemNodeRefs.current[String(item._id)] = node;
              }}
              data-item-id={String(item._id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                if (isOutOfStock) return;
                openCustomization(item, "card");
              }}
              className={`bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col h-full border-2 cursor-pointer ${
                isOutOfStock
                  ? "border-gray-200 opacity-60 grayscale cursor-not-allowed"
                  : isAtMaxStock
                    ? "border-gray-200 opacity-65 grayscale hover:shadow-lg"
                    : "border-white hover:shadow-2xl hover:border-[#bde7de]"
              }`}
            >
              <div className="relative h-48 bg-linear-to-br from-[#ebfaf6] via-[#e2f6f0] to-[#ebfaf6] overflow-hidden group">
                {item.imageUrl ? (
                  <>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="absolute inset-0 block h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
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
                    <DescriptionText
                      itemId={String(item._id)}
                      text={item.description}
                    />
                  </div>
                )}

                {offers.length > 0 && (
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {visibleOffers.map((offer, idx) => (
                      <OfferBadge
                        key={`${item._id}-offer-${idx}`}
                        offer={offer}
                        size="sm"
                      />
                    ))}
                    {hiddenOffersCount > 0 && (
                      <span className="inline-flex items-center rounded-full text-[9px] px-2 py-0.5 font-black bg-[#e8f7f3] text-[#0e9f89] border border-[#cdebe4]">
                        +{hiddenOffersCount}
                      </span>
                    )}
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
                    {discountOffer ? (
                      <div className="flex flex-col">
                        <span
                          className="text-sm line-through text-gray-400"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          ₹{item.price.toFixed(2)}
                        </span>
                        <span
                          className="text-2xl font-black text-[#0e9f89]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          ₹
                          {(
                            item.price *
                            (1 - (discountOffer.discountPercent || 0) / 100)
                          ).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span
                        className="text-2xl font-black bg-linear-to-r from-[#0e9f89] to-[#16b8a1] bg-clip-text text-transparent"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        ₹{item.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <motion.button
                    onClick={() => {
                      if (isOutOfStock) {
                        trackEvent({
                          name: "kiosk.menu_item_out_of_stock_attempted",
                          page: "menu",
                          component: "menu_grid",
                          action: "blocked",
                          target: String(item._id),
                          payload: {
                            source: "add_button",
                            isAtMaxStock,
                          },
                        });
                        return;
                      }
                      trackEvent({
                        name: "kiosk.menu_item_add_clicked",
                        page: "menu",
                        component: "menu_grid",
                        action: "add_click",
                        target: String(item._id),
                        payload: {
                          source: "add_button",
                        },
                      });
                      openCustomization(item, "add_button");
                    }}
                    disabled={isOutOfStock}
                    whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
                    whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
                    className={`h-12 min-w-[108px] px-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
                      isOutOfStock
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-linear-to-br from-[#16b8a1] via-[#0e9f89] to-[#16b8a1] hover:from-[#0fb39a] hover:via-[#0b8b78] hover:to-[#0fb39a] text-white shadow-[#8edfd1]/45"
                    }`}
                  >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    <span className="text-sm">Add</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <CustomizeItemDialouge
        key={
          customizationItem
            ? String(customizationItem._id)
            : "customization-closed"
        }
        open={!!customizationItem}
        item={customizationItem}
        initialQuantity={
          customizationItem
            ? cart
                .filter((line) => line.itemId === customizationItem._id)
                .reduce((sum, line) => sum + line.quantity, 0)
            : 0
        }
        maxQuantity={
          customizationItem?.stockQuantity ?? Number.POSITIVE_INFINITY
        }
        onClose={() => setCustomizationItem(null)}
        onConfirm={(customizationItemIds, quantityToSet) => {
          if (!customizationItem) return;
          const cartLinesForItem = cart.filter(
            (line) => line.itemId === customizationItem._id,
          );
          const quantityInCart = cartLinesForItem.reduce(
            (sum, line) => sum + line.quantity,
            0,
          );

          trackEvent({
            name: "kiosk.menu_item_add_confirmed",
            page: "menu",
            component: "menu_grid",
            action: "add_confirm",
            target: String(customizationItem._id),
            payload: {
              customizationCount: customizationItemIds.length,
              quantityBefore: quantityInCart,
              quantityAfter: quantityToSet,
            },
          });

          if (quantityToSet > quantityInCart) {
            const quantityToAdd = quantityToSet - quantityInCart;
            const selectedCustomizations = (
              customizationItem.customizationOptions || []
            ).filter((option) => customizationItemIds.includes(option.itemId));
            for (let i = 0; i < quantityToAdd; i += 1) {
              onAddToCart({
                ...customizationItem,
                selectedCustomizations,
              } as MenuItem & {
                selectedCustomizations: NonNullable<
                  CartItem["selectedCustomizations"]
                >;
              });
            }
          } else if (quantityToSet < quantityInCart) {
            let toRemove = quantityInCart - quantityToSet;
            for (const line of [...cartLinesForItem].reverse()) {
              if (toRemove <= 0) break;
              const decrement = Math.min(line.quantity, toRemove);
              onUpdateQuantity(line.cartItemId, -decrement);
              toRemove -= decrement;
            }
          }

          setCustomizationItem(null);
        }}
      />
    </>
  );
}
