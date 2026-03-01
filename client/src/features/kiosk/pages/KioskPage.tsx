import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { processQueue } from "@/shared/lib/syncEngine";

import CategoryTabs from "../components/CategoryTabs";
import MenuGrid from "../components/MenuGrid";
import {
  CategoryTabsSkeleton,
  MenuGridSkeleton,
} from "../components/LoadingSkeleton";
import KioskHeader from "../components/KioskHeader";
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
    selectedItems,
    isLoading,
    loadMenu,
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
    <div className="h-screen flex flex-row bg-gradient-to-br from-gray-50 via-white to-orange-50/30 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <KioskHeader
          totalItems={totalItems}
          totalPrice={totalPrice}
          isCartOpen={isCartOpen}
          onToggleCart={() => setIsCartOpen(!isCartOpen)}
        />

        <div className="bg-white shadow-md z-10">
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

        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
          {isLoading ? (
            <MenuGridSkeleton />
          ) : (
            <MenuGrid
              items={selectedItems}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
            />
          )}
        </main>
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
