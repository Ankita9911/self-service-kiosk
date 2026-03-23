import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import CartPanel from "./CartPanel";
import type { CartItem } from "../types/cartItem.types";
import type {
  RecommendedItem,
  CompleteMealResult,
} from "../services/recommendation.service";
import type { MenuItem } from "../types/menu.types";

interface CartSidebarProps {
  isCartOpen: boolean;
  cart: CartItem[];
  cartSyncAlerts: string[];
  totalItems: number;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  isProcessing: boolean;
  // Recommendation props (optional — gracefully omitted when not ready)
  frequentlyBoughtTogether?: RecommendedItem[];
  isFbtLoading?: boolean;
  completeMeal?: CompleteMealResult;
  isMealLoading?: boolean;
  onAddRecommendedItem?: (item: MenuItem) => void;
  onAddComboToCart?: (combo: {
    _id: string;
    name: string;
    comboPrice: number;
    imageUrl?: string;
  }) => void;
}

export default function CartSidebar({
  isCartOpen,
  cart,
  cartSyncAlerts,
  totalItems,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isProcessing,
  frequentlyBoughtTogether,
  isFbtLoading,
  completeMeal,
  isMealLoading,
  onAddRecommendedItem,
  onAddComboToCart,
}: CartSidebarProps) {
  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-black/35 backdrop-blur-[1px]"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.section
        initial={false}
        animate={{ y: isCartOpen ? 0 : "105%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="absolute inset-x-0 bottom-0 z-40 h-[88%] rounded-t-[30px] border-t border-[#bde7de] bg-white shadow-[0_-22px_50px_rgba(15,23,42,0.28)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-[#ddf2ed] bg-linear-to-r from-[#f4fbf9] via-white to-[#edf9f6] px-5 py-3.5">
          <div className="mb-2 flex justify-center">
            <div className="h-1.5 w-14 rounded-full bg-[#bde7de]" />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-bold text-slate-500 hover:bg-[#eaf7f3] hover:text-[#0e9f89] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              Cart
            </button>

            <div className="text-center">
              <h2 className="text-base font-black text-slate-800 tracking-tight">
                Your Cart
              </h2>
              <p className="text-[11px] font-semibold text-slate-400">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-[#eaf7f3] hover:text-[#0e9f89] transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <CartPanel
            cart={cart}
            cartSyncAlerts={cartSyncAlerts}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onPlaceOrder={onCheckout}
            isProcessing={isProcessing}
            frequentlyBoughtTogether={frequentlyBoughtTogether}
            isFbtLoading={isFbtLoading}
            completeMeal={completeMeal}
            isMealLoading={isMealLoading}
            onAddRecommendedItem={onAddRecommendedItem}
            onAddComboToCart={onAddComboToCart}
          />
        </div>
      </motion.section>
    </>
  );
}
