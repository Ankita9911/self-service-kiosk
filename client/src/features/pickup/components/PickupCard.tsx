import type { Order } from "@/features/kiosk/types/order.types";
import { elapsedMinutes, formatTime, cn } from "@/shared/utils/commonFunction";
interface PickupCardProps {
  order: Order;
  onPickup: (order: Order) => void;
  loading: boolean;
}
export function PickupCard({ order, onPickup, loading }: PickupCardProps) {
  const elapsed = elapsedMinutes(order.createdAt);
  const isReady = order.status === "READY";

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-5 flex flex-col gap-4 shadow-sm transition-all",
        isReady
          ? "bg-green-50 border-green-300"
          : "bg-amber-50 border-amber-200",
        loading && "opacity-60 pointer-events-none",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-gray-800">
              #{order.orderNumber}
            </span>
            {isReady ? (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                READY
              </span>
            ) : (
              <span className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                IN PROGRESS
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatTime(order.createdAt)} ·{" "}
            <span
              className={cn(
                "font-medium",
                elapsed >= 20
                  ? "text-red-600"
                  : elapsed >= 10
                    ? "text-amber-600"
                    : "text-gray-500",
              )}
            >
              {elapsed}m waiting
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium">
            {order.paymentMethod}
          </p>
          <p className="text-lg font-bold text-gray-800 mt-0.5">
            ₹{order.totalAmount.toFixed(0)}
          </p>
        </div>
      </div>

      <div className="bg-white/70 rounded-xl p-3 flex flex-col gap-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-700">
              <span className="font-bold">{item.quantity}×</span>{" "}
              {item.nameSnapshot}
            </span>
            <span className="text-gray-500">₹{item.lineTotal.toFixed(0)}</span>
          </div>
        ))}
      </div>

      {isReady ? (
        <button
          onClick={() => onPickup(order)}
          disabled={loading}
          className={cn(
            "w-full py-3 rounded-xl text-base font-bold transition-all",
            "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg active:scale-95",
            loading && "cursor-not-allowed opacity-70",
          )}
        >
          {loading ? "Processing..." : "✓ Mark as Picked Up"}
        </button>
      ) : (
        <div className="w-full py-3 rounded-xl text-sm font-medium text-center text-amber-600 bg-amber-100 border border-amber-200">
          ⏳ Being prepared in kitchen...
        </div>
      )}
    </div>
  );
}
