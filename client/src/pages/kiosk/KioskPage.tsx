import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import axiosInstance from "../../lib/axios";
import { getMenuFromCache, saveMenu } from "../../lib/menuCache";
import type { MenuCategory } from "../../lib/menuCache";
import { addToQueue } from "../../lib/orderQueue";
import { processQueue } from "../../lib/syncEngine";
import CategoryTabs from "./component/CategoryTabs";
import MenuGrid from "./component/MenuGrid";
import CartPanel from "./component/CartPanel";
import type { CartItem } from "./component/CartPanel";

import { 
  Loader2, 
  CheckCircle2, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ArrowRight,
  ChevronLeft,
  ShoppingBag,
  X
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
// import { cn } from "../../components/ui/utils";

type PaymentStep = "SELECTION" | "DETAILS";

export default function KioskPage() {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(true); // Cart visible by default
  
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("SELECTION");
  const [selectedMethod, setSelectedMethod] = useState<"CASH" | "CARD" | "UPI" | "">("");
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");

  useEffect(() => {
    loadMenu();
    processQueue();
  }, []);

  async function loadMenu() {
    try {
      setIsLoading(true);
      const cachedMenu = (await getMenuFromCache()) as MenuCategory[];
      if (cachedMenu?.length > 0) {
        setMenu(cachedMenu);
        setSelectedCategory(cachedMenu[0]._id);
      }
      try {
        const response = await axiosInstance.get("/kiosk/menu");
        const freshMenu = response.data.data.sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        setMenu(freshMenu);
        if (freshMenu.length > 0) setSelectedCategory(freshMenu[0]._id);
        await saveMenu(freshMenu);
      } catch {
        if (!cachedMenu?.length) toast.error("Offline: No menu found.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === item._id);
      if (existing) {
        if (existing.quantity >= item.stockQuantity) {
          toast.error(`Stock limit reached`);
          return prev;
        }
        return prev.map((c) => c.itemId === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      toast.success(`${item.name} added to cart!`);
      return [...prev, { itemId: item._id, name: item.name, price: item.price, quantity: 1, stockQuantity: item.stockQuantity }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => prev.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    setIsCartOpen(false);
    setPaymentStep("SELECTION");
    setShowPaymentDialog(true);
  };

  async function handleConfirmOrder() {
    setIsProcessing(true);
    setShowPaymentDialog(false);
    try {
      const clientOrderId = uuidv4();
      const orderData = { clientOrderId, paymentMethod: selectedMethod, items: cart.map((item) => ({ itemId: item.itemId, quantity: item.quantity })) };
      try {
        const response = await axiosInstance.post("/orders", orderData);
        setOrderNumber(response.data.data.orderNumber.toString());
        setShowSuccessDialog(true);
        setCart([]);
      } catch (error: any) {
        if (!error.response) {
          await addToQueue(orderData);
          toast.warning("Offline: Order queued.");
          setCart([]);
        } else {
          toast.error(error.response.data?.error?.message || "Order failed");
        }
      }
    } finally {
      setIsProcessing(false);
      setSelectedMethod("");
    }
  }

  const selectedItems = menu.find((cat) => cat._id === selectedCategory)?.items || [];
  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-orange-50 overflow-hidden">
      
      {/* COMPACT TOP BANNER */}
      <header className="relative h-20 w-full flex items-center justify-between px-8 overflow-hidden shrink-0 border-b-2 border-orange-100">
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-90" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-lg">
            Hyper <span className="text-yellow-300">Kitchen</span>
          </h1>
        </div>

        {/* Cart Summary Display */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm h-14 px-6 rounded-2xl flex gap-4 items-center border-2 border-white/30">
          <ShoppingBag className="w-6 h-6 text-white" strokeWidth={2.5} />
          <div className="text-left">
            <p className="text-xs font-bold text-orange-100 uppercase tracking-wider leading-none">Cart Total</p>
            <p className="text-xl font-black text-white leading-none italic">₹{totalPrice}</p>
          </div>
          {totalItems > 0 && (
            <span className="bg-orange-600 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-all active:scale-90"
          >
            {isCartOpen ? (
              <X className="w-5 h-5 text-white" strokeWidth={2.5} />
            ) : (
              <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </header>

      {/* CATEGORY BAR */}
      <div className="bg-white shadow-sm z-10">
        <CategoryTabs categories={menu} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </div>

      {/* MAIN CONTENT - TWO COLUMN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: MENU GRID */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-16 h-16 animate-spin text-orange-500" />
              <p className="text-xl font-black text-slate-400 uppercase italic">Loading Menu...</p>
            </div>
          ) : (
            <MenuGrid items={selectedItems} cart={cart} onAddToCart={handleAddToCart} onUpdateQuantity={handleUpdateQuantity} />
          )}
        </main>

        {/* RIGHT: CART PANEL - TOGGLEABLE */}
        {isCartOpen && (
          <aside className="w-[400px] bg-white flex flex-col border-l-2 border-orange-100 shadow-lg transition-all duration-300">
            <div className="p-4 border-b-2 border-orange-100 bg-gradient-to-r from-orange-500 to-orange-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <ShoppingBag className="text-white w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Your Order</h2>
                  <p className="text-orange-100 text-xs font-bold">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <CartPanel
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={(id) => handleUpdateQuantity(id, -cart.find(i => i.itemId === id)!.quantity)}
                onPlaceOrder={handleOpenCheckout} 
                isProcessing={isProcessing}
              />
            </div>
          </aside>
        )}
      </div>

      {/* PAYMENT FLOW DIALOG - COMPACT */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl border-2 border-orange-200 shadow-xl">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <CreditCard className="w-32 h-32" />
            </div>
            <DialogTitle className="text-2xl font-black italic tracking-tight uppercase">Checkout</DialogTitle>
            <DialogDescription className="text-orange-100 font-bold text-sm mt-2">
              Total: <span className="text-white text-xl ml-2 font-black italic">₹{(totalPrice * 1.05).toFixed(2)}</span>
            </DialogDescription>
          </div>

          <div className="p-6 bg-white">
            {paymentStep === "SELECTION" ? (
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 text-center">Choose Payment</p>
                <div className="grid grid-cols-1 gap-3">
                  <PaymentOption 
                    icon={<CreditCard className="w-5 h-5" />} 
                    label="Card Payment" 
                    sub="Visa, Mastercard, RuPay" 
                    onClick={() => { setSelectedMethod("CARD"); setPaymentStep("DETAILS"); }} 
                  />
                  <PaymentOption 
                    icon={<Smartphone className="w-5 h-5" />} 
                    label="UPI / QR Scan" 
                    sub="GPay, PhonePe, Paytm" 
                    onClick={() => { setSelectedMethod("UPI"); setPaymentStep("DETAILS"); }} 
                  />
                  <PaymentOption 
                    icon={<Banknote className="w-5 h-5" />} 
                    label="Cash at Counter" 
                    sub="Pay on Collection" 
                    onClick={() => { setSelectedMethod("CASH"); setPaymentStep("DETAILS"); }} 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                <button 
                  onClick={() => setPaymentStep("SELECTION")} 
                  className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={3} /> Go Back
                </button>

                {selectedMethod === "CARD" && (
                   <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-600 uppercase tracking-wider">Card Holder Name</Label>
                        <Input placeholder="FULL NAME" className="h-12 text-base rounded-xl border-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-slate-600 uppercase tracking-wider">Expiry</Label>
                          <Input placeholder="MM/YY" className="h-12 text-base rounded-xl border-2" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-slate-600 uppercase tracking-wider">CVV</Label>
                          <Input placeholder="***" type="password" className="h-12 text-base rounded-xl border-2" />
                        </div>
                      </div>
                   </div>
                )}

                {selectedMethod === "UPI" && (
                  <div className="space-y-4 text-center">
                    <div className="p-6 bg-orange-50 rounded-2xl border-2 border-dashed border-orange-300">
                       <div className="w-40 h-40 bg-white shadow-lg mx-auto rounded-xl flex items-center justify-center p-3 border-2 border-orange-100">
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=hyperkitchen@upi" alt="QR" className="w-full h-full" />
                       </div>
                       <p className="text-sm font-black text-orange-600 uppercase tracking-wider mt-4">Scan to Pay</p>
                       <p className="text-xs text-slate-400 font-bold mt-1">Any UPI App</p>
                    </div>
                  </div>
                )}

                {selectedMethod === "CASH" && (
                  <div className="py-8 text-center space-y-3 bg-gradient-to-br from-slate-50 to-orange-50 rounded-2xl border-2 border-orange-100">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md border-2 border-orange-100">
                      <Banknote className="w-8 h-8 text-orange-500" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-xl uppercase italic">Ready to Order!</p>
                      <p className="text-slate-500 text-sm font-bold px-6 mt-2 leading-relaxed">
                        Pay at counter when collecting
                      </p>
                    </div> 
                  </div>
                )}

                <Button 
                  className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-lg rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 uppercase italic" 
                  onClick={handleConfirmOrder}
                >
                  Confirm Order <ArrowRight className="ml-2 w-6 h-6" strokeWidth={3} />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* SUCCESS DIALOG - COMPACT */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl p-8 text-center border-2 border-green-200 shadow-xl bg-gradient-to-br from-white to-green-50">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-500 shadow-lg border-2 border-white">
              <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={2.5} />
            </div>
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase mb-2">Success!</DialogTitle>
            <DialogDescription className="text-slate-500 text-base font-bold">
              Your order is confirmed
            </DialogDescription>
            <div className="my-6 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-white shadow-inner">
               <p className="text-xs font-black text-orange-500 uppercase tracking-wider mb-2">Order Number</p>
               <div className="text-5xl font-black text-orange-600 italic tracking-tighter drop-shadow-sm">#{orderNumber}</div>
            </div>
            <p className="text-slate-400 font-bold mb-4 text-sm">Show this at the counter</p>
            <Button 
              onClick={() => setShowSuccessDialog(false)} 
              className="w-full h-14 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-black hover:to-slate-800 rounded-xl text-lg font-black italic uppercase shadow-lg transition-all active:scale-95"
            >
              Start New Order
            </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Payment Option Component - Compact
function PaymentOption({ icon, label, sub, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  sub: string; 
  onClick: () => void; 
}) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50/50 transition-all group active:scale-[0.97] w-full shadow-md hover:shadow-lg"
    >
      <div className="flex items-center gap-3 text-left">
        <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-orange-500 group-hover:text-white text-slate-400 transition-all shadow-sm">
          {icon}
        </div>
        <div>
          <p className="font-black text-sm text-slate-800 uppercase tracking-tight italic leading-tight">{label}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{sub}</p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" strokeWidth={2.5} />
    </button>
  );
}