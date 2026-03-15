import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import type { CartItem } from "../types/cartItem.types";
import { effectiveLineTotal } from "../hooks/useKioskCart";
import FrequentlyBoughtTogether from "./FrequentlyBoughtTogether";
import CompleteMealSuggestion from "./CompleteMealSuggestion";
import type {
  RecommendedItem,
  CompleteMealResult,
} from "../services/recommendation.service";
import type { MenuItem } from "../types/menu.types";

interface CartPanelProps {
  cart: CartItem[];
  cartSyncAlerts: string[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onPlaceOrder: () => void;
  isProcessing: boolean;
  // Recommendation props
  frequentlyBoughtTogether?: RecommendedItem[];
  isFbtLoading?: boolean;
  completeMeal?: CompleteMealResult;
  isMealLoading?: boolean;
  onAddRecommendedItem?: (item: MenuItem) => void;
  onAddComboToCart?: (combo: {
    _id: string;
    name: string;
    comboPrice: number;
  }) => void;
}

export default function CartPanel({
  cart,
  cartSyncAlerts,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  isProcessing,
  frequentlyBoughtTogether = [],
  isFbtLoading = false,
  completeMeal = { suggestions: [], comboDeal: null },
  isMealLoading = false,
  onAddRecommendedItem,
  onAddComboToCart,
}: CartPanelProps) {
  const subtotal = cart.reduce(
    (sum, item) => sum + effectiveLineTotal(item),
    0,
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const showFbt =
    cart.length > 0 &&
    onAddRecommendedItem &&
    (isFbtLoading || frequentlyBoughtTogether.length > 0);

  const showMeal =
    cart.length > 0 &&
    onAddRecommendedItem &&
    onAddComboToCart &&
    (isMealLoading ||
      completeMeal.suggestions.length > 0 ||
      completeMeal.comboDeal !== null);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="relative mb-6">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-200/20 to-transparent"></div>
            <ShoppingCart
              className="w-16 h-16 text-orange-400 relative z-10"
              strokeWidth={1.5}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Plus className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
        </div>
        <h3
          className="text-xl font-bold text-gray-800 mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your Cart is Empty
        </h3>
        <p
          className="text-gray-500 font-medium"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Start adding delicious items!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Scrollable area: cart items + recommendations ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
        {/* Cart sync alerts */}
        <div className="p-4 space-y-3">
          {cartSyncAlerts.length > 0 && (
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <p
                  className="text-sm font-black text-amber-800"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Cart updated due to latest stock/price changes
                </p>
              </div>
              <div className="space-y-1">
                {cartSyncAlerts.map((alert, idx) => (
                  <p
                    key={`${alert}-${idx}`}
                    className="text-xs font-semibold text-amber-800"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    • {alert}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Cart items */}
          {cart.map((item) => {
            const isAtMaxStock = item.quantity >= item.stockQuantity;
            const isLowStock = item.stockQuantity <= 3;

            return (
              <div
                key={item.cartItemId}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border-2 border-gray-100 hover:border-orange-200 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-2">
                    <h4
                      className="text-base font-bold text-gray-900 leading-tight mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.name}
                      {item.isCombo && (
                        <span className="ml-1.5 text-[10px] font-black bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                          COMBO
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.offerType === "DISCOUNT" && item.discountPercent ? (
                        <>
                          <p
                            className="text-xs line-through text-gray-400"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            ₹{item.price.toFixed(2)}
                          </p>
                          <p className="text-xs font-bold text-red-500">
                            ₹
                            {(
                              item.price *
                              (1 - item.discountPercent / 100)
                            ).toFixed(2)}{" "}
                            each
                          </p>
                          <span className="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                            {item.discountPercent}% OFF
                          </span>
                        </>
                      ) : item.offerType === "BOGO" ? (
                        <>
                          <p
                            className="text-sm font-semibold text-gray-500"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            ₹{item.price.toFixed(2)} each
                          </p>
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">
                            BUY 1 GET 1
                          </span>
                        </>
                      ) : (
                        <p
                          className="text-sm font-semibold text-gray-500"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          ₹{item.price.toFixed(2)} each
                        </p>
                      )}
                    </div>
                    {isLowStock && (
                      <div className="flex items-center gap-1 mt-1">
                        <Package className="w-3 h-3 text-amber-600" />
                        <span
                          className="text-xs font-bold text-amber-600"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          Only {item.stockQuantity} left
                        </span>
                      </div>
                    )}
                    {(item.selectedCustomizations || []).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.selectedCustomizations!.map((option) => (
                          <p
                            key={option.itemId}
                            className="text-[11px] font-semibold text-gray-600"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            + {option.name} (Rs {option.price.toFixed(2)})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.cartItemId)}
                    className="p-2 hover:bg-red-50 rounded-xl transition-all group shrink-0"
                  >
                    <Trash2
                      className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors"
                      strokeWidth={2}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-md border-2 border-gray-100">
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all active:scale-95"
                    >
                      <Minus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <span
                      className="text-lg font-black text-gray-900 min-w-9 text-center"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                      disabled={isAtMaxStock}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        isAtMaxStock
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md active:scale-95"
                      }`}
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p
                      className="text-xs font-semibold text-gray-400 mb-0.5"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      SUBTOTAL
                    </p>
                    <p
                      className="text-xl font-black bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      ₹{effectiveLineTotal(item).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Recommendations ── */}
        {showFbt && (
          <FrequentlyBoughtTogether
            items={frequentlyBoughtTogether}
            isLoading={isFbtLoading}
            cart={cart}
            onAddToCart={onAddRecommendedItem!}
          />
        )}

        {showMeal && (
          <CompleteMealSuggestion
            result={completeMeal}
            isLoading={isMealLoading}
            cart={cart}
            onAddToCart={onAddRecommendedItem!}
            onAddComboToCart={onAddComboToCart!}
          />
        )}
      </div>

      {/* ── Sticky footer: totals + checkout ── */}
      <div className="border-t-4 border-gradient-to-r from-orange-100 via-orange-200 to-orange-100 bg-white p-5 shadow-2xl">
        <div className="space-y-3 mb-5">
          <div className="flex justify-between items-center">
            <span
              className="text-sm font-semibold text-gray-600"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Subtotal
            </span>
            <span
              className="text-base font-bold text-gray-800"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ₹{subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-sm font-semibold text-gray-600"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Tax (5%)
            </span>
            <span
              className="text-base font-bold text-gray-800"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ₹{tax.toFixed(2)}
            </span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2" />
          <div className="flex justify-between items-center pt-1">
            <span
              className="text-base font-bold text-gray-900"
              style={{ fontFamily: "var(--font-display)" }}
            >
              TOTAL
            </span>
            <span
              className="text-3xl font-black bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>

        <Button
          onClick={onPlaceOrder}
          disabled={isProcessing}
          className="w-full h-16 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Checkout
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">→</span>
              </div>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
