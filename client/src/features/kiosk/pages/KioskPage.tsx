import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { processQueue } from "@/shared/lib/syncEngine";

import CategoryTabs from "../components/CategoryTabs";
import MenuGrid from "../components/MenuGrid";
import ComboGrid from "../components/ComboGrid";
import TrendingStrip from "../components/TrendingStrip";
import {
  CategoryTabsSkeleton,
  MenuGridSkeleton,
} from "../components/LoadingSkeleton";
import CartSidebar from "../components/CartSideBar";
import PaymentDialouge from "../components/PaymentDialouge";
import ProcessingOrderDialouge from "../components/ProcessingOrderDialouge";
import SuccessDialouge from "../components/SuccessDialouge";
import FailedOrderDialouge from "../components/FailedOrderDialouge";

import { useKioskMenu } from "../hooks/useKioskMenu";
import { useKioskCart } from "../hooks/useKioskCart";
import { useKioskCheckout } from "../hooks/useKioskCheckout";
import { useKioskForceLogout } from "../hooks/useKioskForceLogout";
import { useRecommendations } from "../hooks/useRecommendations";
import type { OfferType } from "../types/menu.types";
import { getKioskToken } from "@/shared/lib/kioskSession";
import type { CartItem } from "../types/cartItem.types";
import type { Combo, MenuCategory, MenuItem } from "../types/menu.types";

const OFFER_CHIPS: { value: OfferType | null; label: string; emoji: string }[] =
  [
    { value: "DISCOUNT", label: "Deals", emoji: "🏷️" },
    { value: "BOGO", label: "Buy 1 Get 1", emoji: "🎁" },
    { value: "BESTSELLER", label: "Best Seller", emoji: "⭐" },
    { value: "NEW", label: "New", emoji: "✨" },
    { value: "LIMITED", label: "Limited", emoji: "⏳" },
  ];

export default function KioskPage() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(true);
  const [cartSyncAlerts, setCartSyncAlerts] = useState<string[]>([]);

  // Redirect immediately if the device is deactivated by an admin
  useKioskForceLogout();

  const {
    menu,
    selectedCategory,
    setSelectedCategory,
    categoriesWithAll,
    combos,
    selectedItems,
    offerFilter,
    setOfferFilter,
    offerCounts,
    isLoading,
    loadMenu,
    COMBOS_CATEGORY_ID,
  } = useKioskMenu();

  const {
    cart,
    setCart,
    handleAddToCart,
    handleUpdateQuantity,
    totalItems,
    totalPrice,
  } = useKioskCart();

  const {
    showPaymentDialog,
    setShowPaymentDialog,
    showProcessingDialog,
    showSuccessDialog,
    setShowSuccessDialog,
    showFailedDialog,
    setShowFailedDialog,
    failedMessage,
    paymentStep,
    setPaymentStep,
    selectedMethod,
    setSelectedMethod,
    isProcessing,
    orderNumber,
    handleOpenCheckout,
    handleConfirmOrder,
  } = useKioskCheckout(cart, setCart, loadMenu);

  // ── Recommendations ──────────────────────────────────────────────────────
  const {
    trending,
    isTrendingLoading,
    frequentlyBoughtTogether,
    isFbtLoading,
    completeMeal,
    isMealLoading,
  } = useRecommendations(cart, menu);

  // Handler to add a recommended item to cart (mirrors onAddToCart signature)
  const handleAddRecommendedItem = (item: MenuItem) => {
    handleAddToCart(item);
  };

  // Handler for combo upsell in "complete meal" section
  const handleAddComboToCart = (combo: {
    _id: string;
    name: string;
    comboPrice: number;
  }) => {
    handleAddToCart({
      _id: combo._id,
      name: combo.name,
      price: combo.comboPrice,
      comboPrice: combo.comboPrice,
      stockQuantity: 999,
    });
  };

  useEffect(() => {
    processQueue();
  }, []);

  useEffect(() => {
    if (!getKioskToken()) {
      navigate("/kiosk/login", { replace: true });
    }
  }, [navigate]);

  const isOnCombos = selectedCategory === COMBOS_CATEGORY_ID;

  useEffect(() => {
    if (cart.length === 0) {
      if (cartSyncAlerts.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCartSyncAlerts([]);
      }
      return;
    }

    const result = reconcileCartWithCatalog(cart, menu, combos);

    if (result.changed) {
      setCart(result.cart);
      setCartSyncAlerts(result.alerts);
    }
  }, [cart, menu, combos, setCart, cartSyncAlerts.length]);

  return (
    <div className="h-screen flex flex-row bg-gray-50 overflow-hidden">
      {/* ── Left sidebar: offer filter chips ── */}
      <div className="w-[104px] min-w-20 shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm overflow-y-auto scrollbar-none">
        <div className="px-10 py-9.5 flex flex-col bg-white border-r border-gray-100 shadow-sm overflow-y-auto scrollbar-none ">
          <button
            className="text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all active:scale-95"
            onClick={() => navigate("/kiosk/order-type")}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[10px] font-bold">Back</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 px-2 pt-2">
          {OFFER_CHIPS.map(({ value, label, emoji }, index) => {
            if (isOnCombos && value !== null) return null;

            const count = value === null ? undefined : offerCounts[value];
            const isActive = offerFilter === value;

            return (
              <motion.button
                key={String(value)}
                onClick={() => setOfferFilter(value)}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.04,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center focus:outline-none"
                style={{ gap: "6px", minWidth: "72px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    padding: "3px",
                    background: isActive
                      ? "linear-gradient(135deg, #f97316, #ea580c)"
                      : "linear-gradient(135deg, #e4e4e4, #cecece)",
                    boxShadow: isActive
                      ? "0 4px 14px rgba(249, 115, 22, 0.4)"
                      : "0 2px 6px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2.5px solid white",
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    {emoji}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#ea580c" : "#777",
                    textAlign: "center",
                    lineHeight: "1.3",
                    maxWidth: "72px",
                    transition: "color 0.2s ease",
                    fontFamily: "'DM Sans', 'Nunito', sans-serif",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {label}
                </span>

                {count !== undefined && count > 0 && (
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 900,
                      color: isActive ? "#ea580c" : "#777",
                      background: isActive ? "rgba(249, 115, 22, 0.1)" : "#f3f4f6",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {count}
                  </span>
                )}

                <motion.div
                  style={{
                    width: isActive ? "20px" : "0px",
                    height: "3px",
                    borderRadius: "2px",
                    background: "#ea580c",
                    transition: "width 0.3s ease",
                  }}
                />
              </motion.button>
            );
          })}
        </div>

        {offerFilter !== null && !isOnCombos && (
          <div className="px-2 pt-1 pb-4">
            <div className="h-px bg-gray-100 mb-2" />
            <button
              onClick={() => setOfferFilter(null)}
              className="flex flex-col items-center gap-1 w-full py-2.5 px-1 rounded-2xl bg-red-50 text-red-400 hover:bg-red-100 transition-all active:scale-95"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <span className="text-base leading-none font-black">✕</span>
              <span className="text-[10px] font-bold">Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Category tabs */}
        <div className="bg-white border-b border-gray-100 z-10 shadow-sm">
          {isLoading ? (
            <CategoryTabsSkeleton />
          ) : (
            <CategoryTabs
              categories={categoriesWithAll}
              selectedCategory={selectedCategory}
              onCategoryChange={(id) => {
                setSelectedCategory(id);
                if (id === COMBOS_CATEGORY_ID) setOfferFilter(null);
              }}
            />
          )}
        </div>

        {/* Trending strip — only shown on non-combo views */}
        {!isOnCombos && !isLoading && (
          <TrendingStrip
            items={trending}
            isLoading={isTrendingLoading}
            cart={cart}
            onAddToCart={handleAddRecommendedItem}
          />
        )}

        {/* Menu grid */}
        <main className="flex-1 overflow-y-auto scrollbar-hide scrollbar-thumb-orange-200 scrollbar-track-transparent">
          <div className="p-6">
            {isLoading ? (
              <MenuGridSkeleton />
            ) : isOnCombos ? (
              <ComboGrid
                combos={combos}
                cart={cart}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ) : (
              <MenuGrid
                items={selectedItems}
                cart={cart}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
              />
            )}
          </div>
        </main>

        {/* Floating cart button — only when cart is closed */}
        {!isCartOpen && totalItems >= 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 z-30 flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white pl-4 pr-5 py-3.5 rounded-2xl shadow-2xl shadow-orange-400/40 transition-all active:scale-95"
          >
            <div className="relative">
              <span className="text-2xl">🛒</span>
              <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-orange-500">
                {totalItems}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-black leading-none">View Cart</p>
              <p className="text-xs font-semibold opacity-80 mt-0.5">
                ₹{totalPrice.toFixed(2)}
              </p>
            </div>
          </button>
        )}
      </div>

      {/* ── Cart sidebar with recommendations ── */}
      <CartSidebar
        isCartOpen={isCartOpen}
        cart={cart}
        cartSyncAlerts={cartSyncAlerts}
        totalItems={totalItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(cartItemId) => {
          const item = cart.find((i) => i.cartItemId === cartItemId);
          if (item) handleUpdateQuantity(cartItemId, -item.quantity);
        }}
        onCheckout={handleOpenCheckout}
        isProcessing={isProcessing}
        frequentlyBoughtTogether={frequentlyBoughtTogether}
        isFbtLoading={isFbtLoading}
        completeMeal={completeMeal}
        isMealLoading={isMealLoading}
        onAddRecommendedItem={handleAddRecommendedItem}
        onAddComboToCart={handleAddComboToCart}
      />

      <PaymentDialouge
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        paymentStep={paymentStep}
        setPaymentStep={setPaymentStep}
        selectedMethod={selectedMethod}
        setSelectedMethod={setSelectedMethod}
        totalPrice={totalPrice}
        onConfirm={handleConfirmOrder}
      />

      <ProcessingOrderDialouge open={showProcessingDialog} />

      <SuccessDialouge
        open={showSuccessDialog}
        orderNumber={orderNumber}
        onClose={() => setShowSuccessDialog(false)}
      />

      <FailedOrderDialouge
        open={showFailedDialog}
        message={failedMessage}
        onClose={() => setShowFailedDialog(false)}
      />
    </div>
  );
}

// ─── Cart reconciliation (unchanged from original) ────────────────────────────

function reconcileCartWithCatalog(
  cart: CartItem[],
  menu: MenuCategory[],
  combos: Combo[]
): { cart: CartItem[]; alerts: string[]; changed: boolean } {
  const menuById = new Map<string, MenuItem>();
  const comboById = new Map<string, Combo>();

  for (const category of menu) {
    for (const item of category.items || []) {
      menuById.set(String(item._id), item);
    }
  }

  for (const combo of combos) {
    comboById.set(String(combo._id), combo);
  }

  const nextCart: CartItem[] = [];
  const alerts: string[] = [];

  for (const cartItem of cart) {
    if (cartItem.isCombo) {
      const combo = comboById.get(cartItem.itemId);

      if (!combo || combo.isActive === false) {
        alerts.push(`${cartItem.name} was removed because it is no longer available.`);
        continue;
      }

      const nextPrice = combo.comboPrice ?? cartItem.price;
      if (nextPrice !== cartItem.price) {
        alerts.push(
          `${cartItem.name} price changed: Rs ${cartItem.price.toFixed(2)} -> Rs ${nextPrice.toFixed(2)}.`
        );
      }

      nextCart.push({ ...cartItem, price: nextPrice });
      continue;
    }

    const liveItem = menuById.get(cartItem.itemId);

    if (!liveItem || liveItem.isActive === false || liveItem.stockQuantity <= 0) {
      alerts.push(`${cartItem.name} was removed because it is out of stock.`);
      continue;
    }

    const selectedOptions = cartItem.selectedCustomizations || [];
    const liveOptionsMap = new Map(
      (liveItem.customizationOptions || []).map((opt) => [opt.itemId, opt])
    );

    const nextSelectedOptions = [];

    for (const option of selectedOptions) {
      const liveOption = liveOptionsMap.get(option.itemId);
      if (!liveOption || liveOption.stockQuantity <= 0) {
        alerts.push(`${option.name} was removed from ${cartItem.name} because it is unavailable.`);
        continue;
      }

      if (liveOption.price !== option.price) {
        alerts.push(
          `${option.name} price changed: Rs ${option.price.toFixed(2)} -> Rs ${liveOption.price.toFixed(2)}.`
        );
      }

      nextSelectedOptions.push({
        ...option,
        price: liveOption.price,
        stockQuantity: liveOption.stockQuantity,
        name: liveOption.name,
      });
    }

    const optionStockLimit = nextSelectedOptions.length
      ? Math.min(...nextSelectedOptions.map((opt) => opt.stockQuantity))
      : liveItem.stockQuantity;

    const effectiveStockLimit = Math.min(liveItem.stockQuantity, optionStockLimit);
    const reducedQuantity = Math.min(cartItem.quantity, effectiveStockLimit);

    if (reducedQuantity !== cartItem.quantity) {
      alerts.push(
        `${cartItem.name} quantity reduced from ${cartItem.quantity} to ${reducedQuantity} due to stock limits.`
      );
    }

    const firstOffer = liveItem.offers?.[0];

    if (liveItem.price !== cartItem.price) {
      alerts.push(
        `${cartItem.name} price changed: Rs ${cartItem.price.toFixed(2)} -> Rs ${liveItem.price.toFixed(2)}.`
      );
    }

    nextCart.push({
      ...cartItem,
      price: liveItem.price,
      quantity: reducedQuantity,
      stockQuantity: effectiveStockLimit,
      offerType: firstOffer?.type,
      discountPercent: firstOffer?.discountPercent,
      selectedCustomizations: nextSelectedOptions,
    });
  }

  const changed = hasCartChanged(cart, nextCart);
  return { cart: nextCart, alerts, changed };
}

function hasCartChanged(prev: CartItem[], next: CartItem[]): boolean {
  if (prev.length !== next.length) return true;

  for (let i = 0; i < prev.length; i += 1) {
    const a = prev[i];
    const b = next[i];
    if (
      a.cartItemId !== b.cartItemId ||
      a.itemId !== b.itemId ||
      a.price !== b.price ||
      a.quantity !== b.quantity ||
      a.stockQuantity !== b.stockQuantity ||
      a.offerType !== b.offerType ||
      a.discountPercent !== b.discountPercent ||
      JSON.stringify(a.selectedCustomizations || []) !==
        JSON.stringify(b.selectedCustomizations || [])
    ) {
      return true;
    }
  }

  return false;
}
