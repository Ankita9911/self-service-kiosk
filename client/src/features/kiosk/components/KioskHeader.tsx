import { motion } from "framer-motion";
import { Clock, Store as StoreIcon, ShoppingCart } from "lucide-react";

interface KioskHeaderProps {
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  onToggleCart: () => void;
}

export default function KioskHeader({
  totalItems,
  totalPrice,
  isCartOpen,
  onToggleCart,
}: KioskHeaderProps) {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="relative h-24 w-full flex items-center justify-between px-8 shrink-0 border-b-4 border-orange-500 shadow-lg overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)",
        }}
      />

      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
          <StoreIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1
            className="text-3xl font-black text-white tracking-tight leading-none drop-shadow-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            HyperKitchen
          </h1>
          <p
            className="text-orange-100 text-sm font-semibold mt-0.5 flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Clock className="w-3.5 h-3.5" />
            {currentTime} • Self Service Kiosk
          </p>
        </div>
      </div>

      <motion.button
        onClick={onToggleCart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 bg-white h-14 pl-2 pr-5 rounded-2xl flex items-center gap-3 shadow-2xl hover:shadow-3xl transition-all border border-orange-100"
      >
        <div className="bg-orange-500 text-white h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-md">
          <span
            className="text-lg font-black leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <ShoppingCart />
          </span>
        </div>
        <div className="text-left">
          <p
            className="text-xl font-black text-orange-600 leading-tight mb-0.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            View Cart
          </p>
          <p
            className="text-xs font-bold text-gray-400 leading-none uppercase tracking-wide"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {totalItems === 0
              ? ""
              : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          </p>
        </div>
      </motion.button>
    </header>
  );
}
