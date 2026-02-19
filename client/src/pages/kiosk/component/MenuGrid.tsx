import { Plus, ImageOff, Minus } from "lucide-react";
import type { MenuItem } from "../../../lib/menuCache";
import type { CartItem } from "./CartPanel";

interface MenuGridProps {
  items: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
}

export default function MenuGrid({ items, cart, onAddToCart, onUpdateQuantity }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-300">
        <ImageOff className="w-24 h-24 mb-4" />
        <p className="text-2xl font-bold">No items available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const cartItem = cart.find(c => c.itemId === item._id);
        const quantity = cartItem?.quantity || 0;

        return (
          <div
            key={item._id}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full group border-2 border-white hover:border-orange-100"
          >
            {/* Image Container - Compact */}
            <div className="relative h-40 bg-gradient-to-br from-orange-50 to-slate-50 overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="w-12 h-12 text-slate-200" />
                </div>
              )}
              
              {/* Stock badge */}
              {item.stockQuantity < 10 && item.stockQuantity > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                  Only {item.stockQuantity} left
                </div>
              )}
            </div>

            {/* Content - Compact */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tight mb-2 leading-tight">
                {item.name}
              </h3>
              
              {/* Spacer */}
              <div className="flex-1" />
              
              {/* Price and Add Button */}
              <div className="flex items-center justify-between gap-3 mt-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price</span>
                  <span className="text-2xl font-black text-orange-600 italic">₹{item.price}</span>
                </div>
                
                {quantity === 0 ? (
                  <button
                    onClick={() => onAddToCart(item)}
                    disabled={item.stockQuantity === 0}
                    className={`
                      p-3 rounded-xl font-black uppercase tracking-wider
                      transition-all duration-300 active:scale-90
                      flex items-center justify-center gap-2 shadow-md
                      ${item.stockQuantity === 0
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-orange-200 hover:shadow-lg'
                      }
                    `}
                  >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-md border-2 border-orange-100">
                    <button
                      onClick={() => onUpdateQuantity(item._id, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-orange-500 hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                    >
                      <Minus className="w-4 h-4" strokeWidth={3} />
                    </button>
                    <span className="text-lg font-black text-slate-800 min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onAddToCart(item)}
                      disabled={quantity >= item.stockQuantity}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                        quantity >= item.stockQuantity
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      <Plus className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>

              {item.stockQuantity === 0 && (
                <p className="text-center text-xs font-bold text-red-500 uppercase tracking-widest mt-2">
                  Out of Stock
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}