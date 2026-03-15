import { PickupCard } from "./PickupCard";
import type { Order } from "@/features/kiosk/types/order.types";

interface PickupOrderGridProps {
  orders: Order[];
  loadingIds: Set<string>;
  onPickup: (order: Order) => void;
}

export function PickupOrderGrid({ orders, loadingIds, onPickup }: PickupOrderGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orders.map((order) => (
        <PickupCard
          key={order._id}
          order={order}
          onPickup={onPickup}
          loading={loadingIds.has(order._id)}
        />
      ))}
    </div>
  );
}
