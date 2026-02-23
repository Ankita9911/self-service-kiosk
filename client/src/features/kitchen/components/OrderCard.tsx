import type { Order,OrderStatus } from "@/features/kiosk/types/order.types";
import type { KitchenStatus } from "../config/kitchen.contant";
import { cn } from "@/shared/utils/commonFunction";
import { STATUS_CONFIG } from "../config/kitchen.contant";
import { formatTime,elapsedMinutes } from "@/shared/utils/commonFunction";

export function OrderCard({
  order,
  onAction,
  loading,
}: {
  order: Order;
  onAction: (order: Order, next: OrderStatus) => void;
  loading: boolean;
}) {
  const status = order.status as KitchenStatus;
  const cfg = STATUS_CONFIG[status];
  const elapsed = elapsedMinutes(order.createdAt);

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-4 flex flex-col gap-3 shadow-sm transition-all",
        cfg.bg,
        cfg.border,
        loading && "opacity-60 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-800">#{order.orderNumber}</span>
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              cfg.color,
              "bg-white/70 border",
              cfg.border
            )}
          >
            {cfg.label}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{formatTime(order.createdAt)}</p>
          <p
            className={cn(
              "text-xs font-medium",
              elapsed >= 15 ? "text-red-600" : elapsed >= 8 ? "text-amber-600" : "text-gray-500"
            )}
          >
            {elapsed}m ago
          </p>
        </div>
      </div>

      {/* Payment badge */}
      <div className="flex gap-2">
        <span className="text-xs bg-white/80 border border-gray-200 rounded px-2 py-0.5 text-gray-600 font-medium">
          {order.paymentMethod}
        </span>
      </div>

      {/* Items */}
      <ul className="flex flex-col gap-1.5">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-800">
              <span className="text-base font-bold mr-1">{item.quantity}×</span>
              {item.nameSnapshot}
            </span>
            <span className="text-xs text-gray-500">
              ₹{item.lineTotal.toFixed(0)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
        <span className="text-sm text-gray-500">Total</span>
        <span className="font-bold text-gray-800">₹{order.totalAmount.toFixed(0)}</span>
      </div>

      {/* Action button */}
      {cfg.next && (
        <button
          onClick={() => onAction(order, cfg.next!)}
          disabled={loading}
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-semibold transition-all",
            status === "CREATED"
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white",
            loading && "cursor-not-allowed"
          )}
        >
          {loading ? "Updating..." : cfg.nextLabel}
        </button>
      )}
    </div>
  );
}