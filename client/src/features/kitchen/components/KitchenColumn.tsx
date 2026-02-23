import type { KitchenStatus } from "../config/kitchen.contant";
import type { OrderStatus } from "@/features/kiosk/types/order.types";
import type{ Order } from "@/features/kiosk/types/order.types";
import { STATUS_CONFIG } from "../config/kitchen.contant";
import { cn } from "@/shared/utils/commonFunction";
import { OrderCard } from "./OrderCard";
export function Column({
  status,
  orders,
  onAction,
  loadingIds,
}: {
  status: KitchenStatus;
  orders: Order[];
  onAction: (order: Order, next: OrderStatus) => void;
  loadingIds: Set<string>;
}) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col gap-3 min-w-0">
    
      <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl", cfg.bg, "border", cfg.border)}>
        <span className={cn("font-bold text-sm", cfg.color)}>{cfg.label}</span>
        <span
          className={cn(
            "ml-auto text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center",
            cfg.color,
            "bg-white border",
            cfg.border
          )}
        >
          {orders.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
        {orders.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-10 border-2 border-dashed border-gray-200 rounded-2xl">
            No orders
          </div>
        ) : (
          orders.map((o) => (
            <OrderCard
              key={o._id}
              order={o}
              onAction={onAction}
              loading={loadingIds.has(o._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
