import { Clock, CheckCircle2, Timer, ShoppingBag } from "lucide-react";
import type { Order } from "@/features/kiosk/types/order.types";
import { elapsedMinutes, formatTime } from "@/shared/utils/commonFunction";

interface PickupCardProps {
  order: Order;
  onPickup: (order: Order) => void;
  loading: boolean;
}

export function PickupCard({ order, onPickup, loading }: PickupCardProps) {
  const elapsed = elapsedMinutes(order.createdAt);
  const isReady = order.status === "READY";

  const elapsedColor =
    elapsed >= 20
      ? "text-red-500 dark:text-red-400"
      : elapsed >= 10
        ? "text-amber-500 dark:text-amber-400"
        : "text-slate-400 dark:text-slate-500";

  return (
    <div
      className={[
        "flex flex-col bg-white dark:bg-[#1e2130] rounded-2xl overflow-hidden transition-all duration-200",
        isReady
          ? "border-2 border-emerald-400/60 dark:border-emerald-400/30 shadow-md shadow-emerald-500/10 dark:shadow-emerald-400/5"
          : "border border-slate-200 dark:border-white/8 shadow-sm",
        loading ? "opacity-50 pointer-events-none" : "hover:shadow-lg",
      ].join(" ")}
    >
      {/* top status bar */}
      <div
        className={`px-4 py-2 flex items-center justify-between ${
          isReady
            ? "bg-emerald-500 dark:bg-emerald-500/90"
            : "bg-amber-50 dark:bg-amber-400/10 border-b border-amber-200 dark:border-amber-400/20"
        }`}
      >
        <div className="flex items-center gap-1.5">
          {isReady ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Ready for Pickup
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 tracking-wide uppercase">
                Preparing
              </span>
            </>
          )}
        </div>
        <div
          className={`flex items-center gap-1 text-[11px] font-bold ${isReady ? "text-white/80" : elapsedColor}`}
        >
          <Clock className="w-3 h-3" />
          {elapsed}m
        </div>
      </div>

      {/* body */}
      <div className="flex flex-col gap-3 p-4">
        {/* order number + meta */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isReady
                  ? "bg-emerald-50 dark:bg-emerald-400/10"
                  : "bg-amber-50 dark:bg-amber-400/10"
              }`}
            >
              <ShoppingBag
                className={`w-4 h-4 ${isReady ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
              />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-none">
                #{order.orderNumber}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {formatTime(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-slate-800 dark:text-white">
              ₹{order.totalAmount.toFixed(0)}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {order.paymentMethod}
            </p>
          </div>
        </div>

        {/* items */}
        <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/4">
          {order.items.map((item, i) => (
            <div
              key={i}
              className={`flex items-baseline justify-between gap-2 px-3 py-1.5 ${
                i > 0 ? "border-t border-slate-100 dark:border-white/5" : ""
              }`}
            >
              <span className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-black text-slate-900 dark:text-white mr-1">
                  {item.quantity}×
                </span>
                {item.nameSnapshot}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                ₹{item.lineTotal.toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        {/* action */}
        {isReady ? (
          <button
            onClick={() => onPickup(order)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.97] transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Mark as Picked Up
              </>
            )}
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20">
            <Timer className="w-3.5 h-3.5" />
            Preparing in kitchen…
          </div>
        )}
      </div>
    </div>
  );
}
