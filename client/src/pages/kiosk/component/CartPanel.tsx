import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/button";

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  stockQuantity: number;
}

interface CartPanelProps {
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onPlaceOrder: () => void;
  isProcessing: boolean;
}

export default function CartPanel({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  isProcessing
}: CartPanelProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; 
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-12 h-12 text-orange-200" />
        </div>
        <h3 className="text-lg font-black text-slate-300 uppercase mb-1">Cart is Empty</h3>
        <p className="text-slate-400 font-medium text-sm">Add items from the menu</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.map((item) => (
          <div key={item.itemId} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight">{item.name}</h4>
                <p className="text-xs font-bold text-slate-400">₹{item.price} each</p>
              </div>
              <button onClick={() => onRemoveItem(item.itemId)} className="p-1.5 hover:bg-red-50 rounded-lg group">
                <Trash2 className="w-4 h-4 text-slate-300 group-hover:text-red-500" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 shadow-sm">
                <button onClick={() => onUpdateQuantity(item.itemId, -1)} className="w-8 h-8 rounded-md bg-slate-50 text-slate-600 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                <span className="text-lg font-black text-slate-800 min-w-8 text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.itemId, 1)} disabled={item.quantity >= item.stockQuantity} className={`w-8 h-8 rounded-md flex items-center justify-center ${item.quantity >= item.stockQuantity ? 'bg-slate-100 text-slate-300' : 'bg-orange-500 text-white'}`}><Plus className="w-4 h-4" /></button>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-lg font-black text-orange-600">₹{item.price * item.quantity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-orange-50 bg-white p-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal</span>
            <span className="text-base font-black text-slate-700">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tax (5%)</span>
            <span className="text-base font-black text-slate-700">₹{tax.toFixed(2)}</span>
          </div>
          <div className="h-px bg-orange-100 my-1" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Total</span>
            <span className="text-2xl font-black text-orange-600">₹{total.toFixed(2)}</span>
          </div>
        </div>
        <Button onClick={onPlaceOrder} disabled={isProcessing} className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-xl uppercase tracking-tight">
          {isProcessing ? "Processing..." : <>Proceed to Payment <ArrowRight className="ml-2 w-6 h-6" /></>}
        </Button>
      </div>
    </div>
  );
}