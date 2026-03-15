import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { COLUMN_ORDER } from "../config/kitchen.constants";
import { useKitchen } from "../hooks/useKitchen";
import { KitchenTopBar } from "../components/KitchenTopBar";
import { Column } from "../components/KitchenColumn";
import { OrderCard } from "../components/OrderCard";
import type { Order, OrderStatus } from "@/features/kiosk/types/order.types";
import type { KitchenStatus } from "../config/kitchen.constants";

export default function KitchenPage() {
  const {
    grouped,
    loadingIds,
    lastUpdated,
    totalActive,
    fetchOrders,
    handleAction,
  } = useKitchen();

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveOrder(
      (event.active.data.current as { order: Order } | undefined)?.order ??
        null,
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrder(null);
    if (!over) return;
    const order = (active.data.current as { order: Order } | undefined)?.order;
    if (!order) return;
    const targetStatus = over.id as KitchenStatus;
    if (order.status === targetStatus) return;
    await handleAction(order, targetStatus as OrderStatus);
  };

  const handleDragCancel = () => setActiveOrder(null);

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f1117]">
        <KitchenTopBar
          totalActive={totalActive}
          lastUpdated={lastUpdated}
          onRefresh={fetchOrders}
        />

        <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
          {COLUMN_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              orders={grouped[status]}
              onAction={handleAction}
              loadingIds={loadingIds}
              isDragging={activeOrder !== null}
            />
          ))}
        </div>
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 220,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeOrder ? (
          <div className="w-full">
            <OrderCard order={activeOrder} overlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
