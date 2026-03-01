import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { processQueue } from "@/shared/lib/syncEngine";

import CategoryTabs from "../components/CategoryTabs";
import MenuGrid from "../components/MenuGrid";
import ComboGrid from "../components/ComboGrid";
import KioskFilterStrip from "../components/KioskFilterStrip";
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

  return (
    <div className="h-screen flex flex-row bg-white overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="bg-white border-b border-slate-100 z-10 flex items-center gap-2">
          <button
            onClick={() => navigate("/kiosk/order-type")}
            className="shrink-0 flex items-center gap-1.5 ml-3 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-sm transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Order Type</span>
          </button>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <CategoryTabsSkeleton />
            ) : (
              <CategoryTabs
                categories={categoriesWithAll}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            )}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
          {/* Offer filter strip — only when NOT on combos tab */}
          {selectedCategory !== COMBOS_CATEGORY_ID && (
            <KioskFilterStrip
              active={offerFilter}
              onChange={setOfferFilter}
              counts={offerCounts}
            />
          )}
          <div className="p-6">
            {isLoading ? (
              <MenuGridSkeleton />
            ) : selectedCategory === COMBOS_CATEGORY_ID ? (
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

        {/* Floating cart button — only visible when cart is closed */}
        {!isCartOpen && totalItems > 0 && (
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
              <p className="text-xs font-semibold opacity-80 mt-0.5">₹{totalPrice.toFixed(2)}</p>
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
