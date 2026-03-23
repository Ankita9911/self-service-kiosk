import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(true);
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

  return (
    <div className="h-screen flex flex-row bg-gray-50 overflow-hidden">
      {/* ── Offer filter sidebar ── */}
      <div className="w-29 min-w-29 shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm overflow-y-auto scrollbar-none">
        <div className="px-10 py-9.5 flex flex-col bg-white border-r border-gray-100 shadow-sm overflow-y-auto scrollbar-none">
          <button
            className="text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all active:scale-95"
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
            <div className="h-px bg-gray-100 mb-2" />
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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

        {!isOnCombos && !isLoading && (
          <TrendingStrip
            items={trending}
            isLoading={isTrendingLoading}
            cart={cart}
            onAddToCart={handleAddRecommendedItem}
          />
        )}

        <main className="flex-1 overflow-y-auto scrollbar-hide scrollbar-thumb-orange-200 scrollbar-track-transparent">
          <div className="p-6">
            {isLoading ? (
              <MenuGridSkeleton />
            ) : isOnCombos ? (
              <ComboGrid
                combos={combos}
                cart={cart}
                onViewCombo={(combo) => setSelectedCombo(combo)}
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
        onClose={() => setShowSuccessDialog(false)}
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
        onClose={() => setSelectedCombo(null)}
        onAddToCart={(combo) => handleAddComboToCart(combo)}
      />
    </div>
  );
}
