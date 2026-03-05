import { motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import CartPanel from "./CartPanel";
import type { CartItem } from "../types/cartItem.types";

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
}: CartSidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCartOpen ? 384 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className="h-full bg-white flex flex-col border-l-4 border-orange-500 shadow-2xl z-20 shrink-0 overflow-hidden"
      style={{ minWidth: 0 }}
    >
      <div className="w-96 min-w-96 flex flex-col h-full">
        <div className=" py-8 p-5 border-b-4 border-orange-100 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                <ShoppingBag className="text-white w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Your Order
                </h2>
                <p className="text-orange-100 text-sm font-bold">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <CartPanel
            cart={cart}
            cartSyncAlerts={cartSyncAlerts}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onPlaceOrder={onCheckout}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </motion.aside>
  );
}
