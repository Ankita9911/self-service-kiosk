import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { motion,AnimatePresence } from "framer-motion";
import kioskAxios from "../../shared/lib/kioskAxios";
import { getMenuFromCache, saveMenu } from "../../shared/lib/menuCache";
import type { MenuCategory } from "../../shared/lib/menuCache";
import { addToQueue } from "../../shared/lib/orderQueue";
import { processQueue } from "../../shared/lib/syncEngine";
import CategoryTabs from "./component/CategoryTabs";
import MenuGrid from "./component/MenuGrid";
import CartPanel from "./component/CartPanel";
import { CategoryTabsSkeleton, MenuGridSkeleton } from "./component/LoadingSkeleton";
import type { CartItem } from "./component/CartPanel";
import { useNavigate } from "react-router-dom";

import { 
  CheckCircle2, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ChevronLeft,
  ShoppingBag,
  X,
  Sparkles,
  Clock,
  Store as StoreIcon
} from "lucide-react";
import { Button } from "../../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../shared/components/ui/dialog";

type PaymentStep = "SELECTION" | "DETAILS";

// Special sentinel ID for the "All" tab
const ALL_CATEGORY_ID = "__ALL__";

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
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  // Default to "All" tab
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY_ID);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(true); 
  
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("SELECTION");
  const [selectedMethod, setSelectedMethod] = useState<"CASH" | "CARD" | "UPI" | "">("");
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");

  useEffect(() => {
    loadMenu();
    processQueue();
  }, []);
  
  // 🔐 Kiosk Auth Guard
  useEffect(() => {
    if (!getKioskToken()) {
      navigate("/kiosk/login", { replace: true });
    }
  }, [navigate]);

  async function loadMenu(silent = false) {
    try {
      if (!silent) setIsLoading(true);
      const cachedMenu = (await getMenuFromCache()) as MenuCategory[];
      if (cachedMenu?.length > 0) {
        const validCategories = cachedMenu.filter(cat => cat.items && cat.items.length > 0);
        setMenu(validCategories);
        // Keep selectedCategory as ALL_CATEGORY_ID — don't override
      }
      try {
        const response = await kioskAxios.get("/kiosk/menu");
        const freshMenu = response.data.data.sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        const validCategories = freshMenu.filter((cat: any) => cat.items && cat.items.length > 0);
        setMenu(validCategories);
        await saveMenu(freshMenu);
        toast.success("Menu loaded successfully", {
          duration: 2000,
          icon: <Sparkles className="w-4 h-4" />,
        });
      } catch (error) {
        if (!cachedMenu?.length) {
          toast.error("Offline: No menu available", {
            description: "Please check your connection",
          });
        } else {
          toast.warning("Using cached menu", {
            description: "Unable to fetch latest updates",
          });
        }
      }
    } finally {
      if (!silent) setTimeout(() => setIsLoading(false), 500);
    }
  }

  const handleAddToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === item._id);
      if (existing) {
        if (existing.quantity >= item.stockQuantity) {
          toast.error(`Maximum quantity reached`, {
            description: `Only ${item.stockQuantity} available in stock`,
          });
          return prev;
        }
        toast.success(`${item.name} quantity updated`, { duration: 1500 });
        return prev.map((c) => c.itemId === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      toast.success(`${item.name} added to cart!`, {
        duration: 1500,
        icon: <ShoppingBag className="w-4 h-4" />,
      });
      return [...prev, { itemId: item._id, name: item.name, price: item.price, quantity: 1, stockQuantity: item.stockQuantity }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0);
      const wasRemoved = prev.some(i => i.itemId === itemId) && !updated.some(i => i.itemId === itemId);
      if (wasRemoved) toast.info("Item removed from cart");
      return updated;
    });
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty", { description: "Add some items before checkout" });
      return;
    }
    setPaymentStep("SELECTION");
    setSelectedMethod("");
    setShowPaymentDialog(true);
  };

  async function handleConfirmOrder() {
    setIsProcessing(true);
    setShowPaymentDialog(false);
    const loadingToast = toast.loading("Processing your order...");
    try {
      const clientOrderId = uuidv4();
      const orderData = { 
        clientOrderId, 
        paymentMethod: selectedMethod, 
        items: cart.map((item) => ({ itemId: item.itemId, quantity: item.quantity })) 
      };
      try {
        const response = await kioskAxios.post("/orders", orderData);
        toast.dismiss(loadingToast);
        setOrderNumber(response.data.data.orderNumber.toString());
        setShowSuccessDialog(true);
        setCart([]);
        toast.success("Order placed successfully!", {
          duration: 3000,
          icon: <CheckCircle2 className="w-5 h-5" />,
        });
        loadMenu(true);
      } catch (error: any) {
        toast.dismiss(loadingToast);
        if (!error.response) {
          await addToQueue(orderData);
          toast.warning("Offline: Order queued", {
            description: "Will be processed when connection is restored",
            duration: 4000,
          });
          setCart([]);
        } else {
          toast.error("Order failed", {
            description: error.response.data?.error?.message || "Please try again",
            duration: 4000,
          });
        }
      }
    } finally {
      setIsProcessing(false);
      setSelectedMethod("");
    }
  }

  // ── Derived: items to show ────────────────────────────────────────────────
  // "All" → flatten all items from every category
  // specific category → items from that category only
  const selectedItems = selectedCategory === ALL_CATEGORY_ID
    ? menu.flatMap(cat => cat.items || [])
    : (menu.find((cat) => cat._id === selectedCategory)?.items || []);

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ── Inject "All" tab at the front of the category list ───────────────────
  const categoriesWithAll: MenuCategory[] = [
    {
      _id: ALL_CATEGORY_ID,
      name: "All",
      items: menu.flatMap(cat => cat.items || []),
    } as MenuCategory,
    ...menu,
  ];

  return (
    <div className="h-screen flex flex-row bg-gradient-to-br from-gray-50 via-white to-orange-50/30 overflow-hidden">
      
      {/* LEFT COLUMN: HEADER, CATEGORIES, MENU */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="relative h-24 w-full flex items-center justify-between px-8 shrink-0 border-b-4 border-orange-500 shadow-lg overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ backgroundImage: `linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)` }}
          />

          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
              <StoreIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>
                HyperKitchen
              </h1>
              <p className="text-orange-100 text-sm font-semibold mt-0.5 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                <Clock className="w-3.5 h-3.5" />
                {currentTime} • Self Service Kiosk
              </p>
            </div>
          </div>

          <motion.button
            onClick={() => setIsCartOpen(!isCartOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative z-10 bg-white h-14 pl-2 pr-5 rounded-2xl flex items-center gap-3 shadow-2xl hover:shadow-3xl transition-all border border-orange-100"
          >
            {/* Item count bubble — like Swiggy/Zomato cart button */}
            <div className="bg-orange-500 text-white h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-md">
              <span className="text-lg font-black leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                {totalItems}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-400 leading-none uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
                {totalItems === 0 ? "View Cart" : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
              </p>
              <p className="text-xl font-black text-orange-600 leading-tight mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                ₹{totalPrice.toFixed(2)}
              </p>
            </div>
          </motion.button>
        </header>

        {/* Category Tabs — includes "All" as first tab */}
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

        {/* Menu Grid */}
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

      {/* RIGHT COLUMN: CART PANEL */}
      <motion.aside
        initial={false}
        animate={{ width: isCartOpen ? 384 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="h-full bg-white flex flex-col border-l-4 border-orange-500 shadow-2xl z-20 shrink-0 overflow-hidden"
        style={{ minWidth: 0 }}
      >
        <div className="w-96 min-w-96 flex flex-col h-full">
          <div className="p-5 border-b-4 border-orange-100 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                  <ShoppingBag className="text-white w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    Your Order
                  </h2>
                  <p className="text-orange-100 text-sm font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                    {totalItems} item{totalItems !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2.5 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <CartPanel
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={(id) => {
                const item = cart.find(i => i.itemId === id);
                if (item) handleUpdateQuantity(id, -item.quantity);
              }}
              onPlaceOrder={handleOpenCheckout} 
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </motion.aside>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-3xl border-4 border-orange-500 shadow-2xl">
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
            <div className="relative z-10">
              <DialogTitle className="text-3xl font-black tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Checkout
              </DialogTitle>
              <DialogDescription className="text-orange-100 font-bold text-base" style={{ fontFamily: 'var(--font-body)' }}>
                Total Amount: <span className="text-white text-2xl ml-2 font-black">₹{(totalPrice * 1.05).toFixed(2)}</span>
              </DialogDescription>
            </div>
          </div>
          <div className="p-8 bg-white">
            <AnimatePresence mode="wait">
              {paymentStep === "SELECTION" ? (
                <motion.div key="selection" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  <p className="text-sm font-black text-gray-500 text-center mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                    SELECT PAYMENT METHOD
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <PaymentOption icon={<CreditCard className="w-6 h-6" />} label="Card Payment" sub="Visa, Mastercard, RuPay" gradient="from-blue-500 to-blue-600" onClick={() => { setSelectedMethod("CARD"); setPaymentStep("DETAILS"); }} />
                    <PaymentOption icon={<Smartphone className="w-6 h-6" />} label="UPI / QR Scan" sub="GPay, PhonePe, Paytm" gradient="from-purple-500 to-purple-600" onClick={() => { setSelectedMethod("UPI"); setPaymentStep("DETAILS"); }} />
                    <PaymentOption icon={<Banknote className="w-6 h-6" />} label="Cash at Counter" sub="Pay on Collection" gradient="from-green-500 to-green-600" onClick={() => { setSelectedMethod("CASH"); setPaymentStep("DETAILS"); }} />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <button onClick={() => setPaymentStep("SELECTION")} className="flex items-center gap-2 text-sm font-black text-orange-600 hover:text-orange-700 transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
                    <ChevronLeft className="w-5 h-5" strokeWidth={3} /> GO BACK
                  </button>
                  {selectedMethod === "UPI" && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl border-4 border-dashed border-purple-300 text-center">
                      <div className="w-48 h-48 bg-white mx-auto rounded-2xl flex items-center justify-center p-4 border-4 border-purple-200 shadow-xl">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=hyperkitchen@upi" alt="UPI QR Code" className="w-full h-full" />
                      </div>
                      <div className="mt-6 space-y-2">
                        <p className="text-lg font-black text-purple-900" style={{ fontFamily: 'var(--font-display)' }}>Scan QR Code to Pay</p>
                        <p className="text-sm text-purple-700 font-semibold" style={{ fontFamily: 'var(--font-body)' }}>Open any UPI app and scan</p>
                      </div>
                    </motion.div>
                  )}
                  {selectedMethod === "CARD" && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl border-4 border-blue-200 text-center">
                      <CreditCard className="w-20 h-20 mx-auto text-blue-600 mb-4" strokeWidth={1.5} />
                      <p className="text-lg font-black text-blue-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Insert or Tap Your Card</p>
                      <p className="text-sm text-blue-700 font-semibold" style={{ fontFamily: 'var(--font-body)' }}>Follow the instructions on the card reader</p>
                    </motion.div>
                  )}
                  {selectedMethod === "CASH" && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl border-4 border-green-200 text-center">
                      <Banknote className="w-20 h-20 mx-auto text-green-600 mb-4" strokeWidth={1.5} />
                      <p className="text-lg font-black text-green-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Pay at Counter</p>
                      <p className="text-sm text-green-700 font-semibold" style={{ fontFamily: 'var(--font-body)' }}>Show your order number to the cashier</p>
                    </motion.div>
                  )}
                  <Button className="w-full h-16 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all" onClick={handleConfirmOrder} style={{ fontFamily: 'var(--font-display)' }}>
                    Confirm Order
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border-4 border-green-500 bg-white">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }} className="p-12 text-center">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", duration: 0.6 }} className="w-28 h-28 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
            </motion.div>
            <DialogTitle className="text-4xl font-black text-gray-900 tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Order Confirmed!
            </DialogTitle>
            <div className="my-8 p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border-4 border-orange-200">
              <p className="text-sm font-black text-orange-600 mb-3" style={{ fontFamily: 'var(--font-body)' }}>YOUR ORDER NUMBER</p>
              <motion.div className="text-6xl font-black bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent tracking-tight" style={{ fontFamily: 'var(--font-display)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                #{orderNumber}
              </motion.div>
            </div>
            <p className="text-gray-600 font-semibold mb-8" style={{ fontFamily: 'var(--font-body)' }}>
              Please collect your order from the counter
            </p>
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full h-16 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-black text-lg rounded-2xl shadow-xl" style={{ fontFamily: 'var(--font-display)' }}>
              Start New Order
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PaymentOption({ icon, label, sub, gradient, onClick }: { icon: React.ReactNode; label: string; sub: string; gradient: string; onClick: () => void; }) {
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-between p-6 rounded-2xl border-2 border-gray-200 hover:border-orange-500 bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all shadow-lg hover:shadow-xl w-full">
      <div className="flex items-center gap-4 text-left">
        <div className={`p-4 bg-gradient-to-br ${gradient} rounded-2xl text-white shadow-lg`}>{icon}</div>
        <div>
          <p className="font-black text-lg text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{label}</p>
          <p className="text-sm font-semibold text-gray-500 mt-1" style={{ fontFamily: 'var(--font-body)' }}>{sub}</p>
        </div>
      </div>
      <ChevronLeft className="w-6 h-6 text-gray-400 rotate-180" strokeWidth={3} />
    </motion.button>
  );
}