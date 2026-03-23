import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { processQueue } from "@/shared/lib/syncEngine";

import CategoryTabs from "../components/CategoryTabs";
import MenuGrid from "../components/MenuGrid";
import ComboGrid from "../components/ComboGrid";
import ComboDetailsDialog from "../components/ComboDetailsDialog";
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

import { useKioskMenu } from "../hooks/usekioskMenu";
import { useKioskCart } from "../hooks/useKioskCart";
import { useKioskCheckout } from "../hooks/useKioskCheckout";
import { useKioskForceLogout } from "../hooks/useKioskForceLogout";
import { useRecommendations } from "../hooks/useRecommendations";
import { reconcileCartWithCatalog } from "../utils/cartReconcile";
import { getKioskToken } from "@/shared/lib/kioskSession";
import type { OfferType } from "../types/menu.types";
import type { Combo, MenuItem } from "../types/menu.types";

const OFFER_CHIPS: { value: OfferType | null; label: string; emoji: string }[] =
  [
    { value: "DISCOUNT", label: "Deals", emoji: "🏷️" },
    { value: "BOGO", label: "Buy 1 Get 1", emoji: "🎁" },
    { value: "BESTSELLER", label: "Best Seller", emoji: "⭐" },
    { value: "NEW", label: "New", emoji: "✨" },
    { value: "LIMITED", label: "Limited", emoji: "⏳" },
  ];

export default function KioskPage() {
  const SUCCESS_REDIRECT_MS = 4000;
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [cartSyncAlerts, setCartSyncAlerts] = useState<string[]>([]);

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

  const {
    trending,
    isTrendingLoading,
    frequentlyBoughtTogether,
    isFbtLoading,
    completeMeal,
    isMealLoading,
  } = useRecommendations(cart, menu);

  const handleAddRecommendedItem = (item: MenuItem) => handleAddToCart(item);

  const handleAddComboToCart = (combo: {
    _id: string;
    name: string;
    comboPrice: number;
    imageUrl?: string;
  }) => {
    handleAddToCart({
      _id: combo._id,
      name: combo.name,
      imageUrl: combo.imageUrl,
      price: combo.comboPrice,
      comboPrice: combo.comboPrice,
      stockQuantity: 999,
    });
  };

  useEffect(() => {
    processQueue();
  }, []);

  useEffect(() => {
    if (!getKioskToken()) navigate("/kiosk/login", { replace: true });
  }, [navigate]);

  const isOnCombos = selectedCategory === COMBOS_CATEGORY_ID;

  useEffect(() => {
    if (cart.length === 0) {
      if (cartSyncAlerts.length > 0) setCartSyncAlerts([]);
      return;
    }
    const result = reconcileCartWithCatalog(cart, menu, combos);
    if (result.changed) {
      setCart(result.cart);
      setCartSyncAlerts(result.alerts);
    }
  }, [cart, menu, combos, setCart, cartSyncAlerts.length]);

  const comboItemMetaMap = Object.fromEntries(
    menu
      .flatMap((category) => category.items || [])
      .map((item) => [
        String(item._id),
        { imageUrl: item.imageUrl, price: item.price },
      ]),
  ) as Record<string, { imageUrl?: string; price?: number }>;

  const handleSuccessComplete = useCallback(() => {
    setShowSuccessDialog(false);
    setShowPaymentDialog(false);
    setIsCartOpen(false);
    navigate("/kiosk/landing", { replace: true });
  }, [navigate, setShowPaymentDialog, setShowSuccessDialog]);

  useEffect(() => {
    if (!showSuccessDialog) return;
    const timer = window.setTimeout(() => {
      handleSuccessComplete();
    }, SUCCESS_REDIRECT_MS);
    return () => window.clearTimeout(timer);
  }, [handleSuccessComplete, showSuccessDialog]);

  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-[#e7f8f4] via-[#f4fbf9] to-white p-3">
      <div className="relative h-full w-full flex flex-row overflow-hidden rounded-[30px] border border-[#d9efe9] bg-white/90 shadow-[0_18px_60px_rgba(14,159,137,0.14)] backdrop-blur-sm">
        {/* ── Offer filter sidebar ── */}
        <div className="w-29 min-w-29 shrink-0 flex flex-col bg-linear-to-b from-[#f8fdfc] to-white border-r border-[#dff1ec] shadow-sm overflow-y-auto scrollbar-none">
          <div className="px-10 py-9.5 flex flex-col bg-transparent overflow-y-auto scrollbar-none">
            <button
              className="text-slate-400 hover:text-[#0e9f89] hover:bg-[#e8f7f3] transition-all active:scale-95 rounded-xl p-1"
              onClick={() => navigate("/kiosk/order-type")}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-[10px] font-bold">Back</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 px-2.5 pt-2">
            {OFFER_CHIPS.map(({ value, label, emoji }, index) => {
              if (isOnCombos && value !== null) return null;
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center justify-start focus:outline-none"
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: "24px",
                    padding: "7px 7px 8px",
                    background: isActive
                      ? "linear-gradient(170deg, #16b8a1 0%, #0e9f89 100%)"
                      : "#ffffff",
                    border: isActive
                      ? "1px solid rgba(12, 154, 133, 0.75)"
                      : "1px solid #eff1f3",
                    boxShadow: isActive
                      ? "0 10px 22px rgba(22, 184, 161, 0.34)"
                      : "0 4px 14px rgba(15, 23, 42, 0.08)",
                    gap: "5px",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      padding: "2px",
                      background: "#ffffff",
                      boxShadow: isActive
                        ? "0 4px 10px rgba(6, 120, 104, 0.28)"
                        : "0 3px 8px rgba(0, 0, 0, 0.14)",
                      transition: "all 0.25s ease",
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
                        border: "2px solid rgba(255,255,255,0.95)",
                        background: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                      }}
                    >
                      {emoji}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? "#ffffff" : "#475569",
                      textAlign: "center",
                      lineHeight: "1.2",
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
                </motion.button>
              );
            })}
          </div>

          {offerFilter !== null && !isOnCombos && (
            <div className="px-2.5 pt-1.5 pb-4">
              <div className="h-px bg-[#dff1ec] mb-2" />
              <button
                onClick={() => setOfferFilter(null)}
                className="flex flex-col items-center gap-1 w-full py-3 px-1 rounded-[22px] bg-white text-slate-500 border border-slate-200 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}
              >
                <span className="text-base leading-none font-black">✕</span>
                <span className="text-[10px] font-bold">Clear</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-linear-to-b from-[#fbfefe] to-[#f5fbf9]">
          <div className="bg-white/95 border-b border-[#dff1ec] z-10 shadow-sm">
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

          <main className="flex-1 overflow-y-auto scrollbar-hide scrollbar-thumb-[#9fded2] scrollbar-track-transparent">
            <div className="p-6">
              {!isOnCombos && !isLoading && (
                <div className="mb-6 -mx-6 px-6">
                  <TrendingStrip
                    items={trending}
                    isLoading={isTrendingLoading}
                    cart={cart}
                    onAddToCart={handleAddRecommendedItem}
                  />
                </div>
              )}

              {isLoading ? (
                <MenuGridSkeleton />
              ) : isOnCombos ? (
                <ComboGrid
                  combos={combos}
                  cart={cart}
                  onViewCombo={(combo) => setSelectedCombo(combo)}
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

          {!isCartOpen && (
            <div className="border-t border-[#dff1ec] bg-white/95 px-4 py-3.5 shadow-[0_-6px_16px_rgba(15,23,42,0.06)]">
              <div className="mx-auto w-full max-w-6xl flex items-center justify-between gap-3">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-[#edf8f5] transition-colors"
                >
                  <div className="relative h-10 w-10 rounded-xl bg-[#e8f7f3] text-[#0e9f89] flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" strokeWidth={2.4} />
                    <span className="absolute -top-1.5 -right-1.5 bg-[#0e9f89] text-white text-[10px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-800 leading-none">
                      {totalItems === 0 ? "Empty Cart" : "View Cart"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {totalItems === 0
                        ? "Looks like you haven't made any choice"
                        : `${totalItems} item${totalItems !== 1 ? "s" : ""} added`}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Total
                    </p>
                    <p className="text-2xl font-black text-[#0e9f89] leading-none">
                      ₹{totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    disabled={totalItems === 0}
                    className="h-12 px-7 rounded-2xl bg-[#0e9f89] hover:bg-[#0b8b78] text-white font-black text-base shadow-lg shadow-[#8edfd1]/45 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Cart sidebar ── */}
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
          onClose={handleSuccessComplete}
        />

        <FailedOrderDialouge
          open={showFailedDialog}
          message={failedMessage}
          onClose={() => setShowFailedDialog(false)}
        />

        <ComboDetailsDialog
          open={Boolean(selectedCombo)}
          combo={selectedCombo}
          quantityInCart={
            selectedCombo
              ? (cart.find((c) => c.itemId === String(selectedCombo._id))
                  ?.quantity ?? 0)
              : 0
          }
          comboItemMetaMap={comboItemMetaMap}
          onClose={() => setSelectedCombo(null)}
          onAddToCart={(combo, quantity) => {
            for (let i = 0; i < quantity; i += 1) {
              handleAddComboToCart(combo);
            }
          }}
        />
      </div>
    </div>
  );
}
