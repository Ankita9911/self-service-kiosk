import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { processQueue } from "@/shared/lib/syncEngine";

import CategoryTabs from "../components/CategoryTabs";
import MenuGrid from "../components/MenuGrid";
import ComboGrid from "../components/ComboGrid";
import {
  CategoryTabsSkeleton,
  MenuGridSkeleton,
} from "../components/LoadingSkeleton";
import CartSidebar from "../components/CartSideBar";
import PaymentDialouge from "../components/PaymentDialouge";
import SuccessDialouge from "../components/SuccessDialouge";

import { useKioskMenu } from "../hooks/usekioskMenu";
import { useKioskCart } from "../hooks/useKioskCart";
import { useKioskCheckout } from "../hooks/useKioskCheckout";
import { useKioskForceLogout } from "../hooks/useKioskForceLogout";
import type { OfferType } from "../types/menu.types";

const OFFER_CHIPS: { value: OfferType | null; label: string; emoji: string }[] =
  [
    { value: null, label: "All", emoji: "🍽️" },
    { value: "DISCOUNT", label: "Deals", emoji: "🏷️" },
    { value: "BOGO", label: "Buy 1 Get 1", emoji: "🎁" },
    { value: "BESTSELLER", label: "Best Seller", emoji: "⭐" },
    { value: "NEW", label: "New", emoji: "✨" },
    { value: "LIMITED", label: "Limited", emoji: "⏳" },
  ];

function getKioskToken(): string | null {
  const token = localStorage.getItem("kiosk_token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "KIOSK_DEVICE") return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return token;
  } catch {
    return null;
  }
}

export default function KioskPage() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(true);

  // Redirect immediately if the device is deactivated by an admin
  useKioskForceLogout();

  const {
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
    showSuccessDialog,
    setShowSuccessDialog,
    paymentStep,
    setPaymentStep,
    selectedMethod,
    setSelectedMethod,
    isProcessing,
    orderNumber,
    handleOpenCheckout,
    handleConfirmOrder,
  } = useKioskCheckout(cart, setCart, loadMenu);

  useEffect(() => {
    processQueue();
  }, []);

  useEffect(() => {
    if (!getKioskToken()) {
      navigate("/kiosk/login", { replace: true });
    }
  }, [navigate]);

  const isOnCombos = selectedCategory === COMBOS_CATEGORY_ID;

  return (
    <div className="h-screen flex flex-row bg-gray-50 overflow-hidden">
      <div className="w-[104px] min-w-20 shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm overflow-y-auto scrollbar-none">
        <div className="px-10 py-9.5 flex flex-col bg-white border-r border-gray-100 shadow-sm overflow-y-auto scrollbar-none ">
          <button 
          className="text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all active:scale-95"
          onClick={() => navigate("/kiosk/order-type")}>
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[10px] font-bold">Back</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 px-2 pt-2">
          {OFFER_CHIPS.map(({ value, label, emoji }) => {
            if (isOnCombos && value !== null) return null;

            const count = value === null ? undefined : offerCounts[value];
            const isActive = offerFilter === value;

            return (
              <button
                key={String(value)}
                onClick={() => setOfferFilter(value)}
                className={`flex flex-col items-center gap-1 w-full py-3 px-1 rounded-2xl transition-all active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-md shadow-orange-300/50"
                    : "bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-orange-500"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span className="text-[10px] font-bold leading-tight text-center">
                  {label}
                </span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/30 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Clear filter — only when an offer filter is active */}
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Horizontal category tabs at the top */}
        <div className="bg-white border-b border-gray-100 z-10 shadow-sm">
          {isLoading ? (
            <CategoryTabsSkeleton />
          ) : (
            <CategoryTabs
              categories={categoriesWithAll}
              selectedCategory={selectedCategory}
              onCategoryChange={(id) => {
                setSelectedCategory(id);
                // clear offer filter when switching to combos
                if (id === COMBOS_CATEGORY_ID) setOfferFilter(null);
              }}
            />
          )}
        </div>

        {/* Menu grid */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
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

      <CartSidebar
        isCartOpen={isCartOpen}
        cart={cart}
        totalItems={totalItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(id) => {
          const item = cart.find((i) => i.itemId === id);
          if (item) handleUpdateQuantity(id, -item.quantity);
        }}
        onCheckout={handleOpenCheckout}
        isProcessing={isProcessing}
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

      <SuccessDialouge
        open={showSuccessDialog}
        orderNumber={orderNumber}
        onClose={() => setShowSuccessDialog(false)}
      />
    </div>
  );
}
