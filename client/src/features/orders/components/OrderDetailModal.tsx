import { X, ShoppingCart, Clock, CreditCard, Package } from "lucide-react";
import type { OrderHistoryItem } from "../types/order.types";

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  CREATED:    { dot: "bg-amber-400",   text: "text-amber-700 dark:text-amber-300",   bg: "bg-amber-50 dark:bg-amber-400/10"     },
  IN_KITCHEN: { dot: "bg-indigo-500",  text: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-50 dark:bg-indigo-400/10"   },
  READY:      { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-400/10" },
  PICKED_UP:  { dot: "bg-slate-400",   text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-100 dark:bg-white/6"         },
  COMPLETED:  { dot: "bg-slate-400",   text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-100 dark:bg-white/6"         },
};

const PAYMENT_COLORS: Record<string, string> = {
  CASH: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
  CARD: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10",
  UPI:  "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrderDetailModalProps {
  order: OrderHistoryItem | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.CREATED;
  const paymentColor = PAYMENT_COLORS[order.paymentMethod] ?? "";

  const itemsTotal = order.items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl border border-slate-100 dark:border-white/8 overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500 shrink-0" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Order #{order.orderNumber}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-white/4 border border-slate-100 dark:border-white/6">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Status</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${statusStyle.bg} ${statusStyle.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  {order.status.replace("_", " ")}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-white/4 border border-slate-100 dark:border-white/6">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Payment</span>
                </div>
                <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-lg w-fit ${paymentColor}`}>
                  {order.paymentMethod}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-white/4 border border-slate-100 dark:border-white/6">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Created By</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {order.createdByRole.replace("_", " ")}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Order Items
              </h4>

              <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-white/6">
                {order.items.map((item, idx) => (
                  <div key={idx}>
                    <div className={`px-4 py-3 flex items-start justify-between gap-3 ${idx > 0 ? "border-t border-slate-50 dark:border-white/4" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-bold text-slate-800 dark:text-white">{item.quantity}×</span>
                          <span className="text-[13px] text-slate-700 dark:text-slate-300 truncate">{item.nameSnapshot}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          ₹{item.priceSnapshot.toFixed(0)} each
                        </div>

                        {item.customizations && item.customizations.length > 0 && (
                          <div className="mt-1.5 space-y-1">
                            {item.customizations.map((c, ci) => (
                              <div key={ci} className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pl-3 border-l-2 border-slate-200 dark:border-white/10">
                                <span>{c.quantity}× {c.nameSnapshot}</span>
                                <span className="font-mono">₹{c.lineTotal.toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[13px] font-semibold text-slate-800 dark:text-white font-mono shrink-0">
                        ₹{item.lineTotal.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-white/4 border border-slate-100 dark:border-white/6 px-4 py-3 space-y-2">
              <div className="flex justify-between text-[12px] text-slate-500 dark:text-slate-400">
                <span>Items subtotal</span>
                <span className="font-mono">₹{itemsTotal.toFixed(0)}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-white/6 pt-2 flex justify-between">
                <span className="text-[13px] font-bold text-slate-800 dark:text-white">Total</span>
                <span className="text-[15px] font-black text-slate-800 dark:text-white font-mono">₹{order.totalAmount.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
