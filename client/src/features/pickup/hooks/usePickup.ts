import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "@/features/kiosk/services/order.service";
import { useSocket } from "@/shared/hooks/useSocket";
import type { Order, OrderStatus } from "@/features/kiosk/types/order.types";

export function usePickup() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders(["IN_KITCHEN", "READY"]);
      setOrders(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleNewOrder = useCallback((_order: Order) => {
    // Pickup doesn't handle CREATED orders
  }, []);

  const handleStatusUpdated = useCallback(
    ({ orderId, status, order }: { orderId: string; status: OrderStatus; order: Order }) => {
      if (status === "PICKED_UP" || status === "COMPLETED") {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else if (status === "READY" || status === "IN_KITCHEN") {
        setOrders((prev) => {
          const exists = prev.find((o) => o._id === orderId);
          if (exists) {
            return prev.map((o) =>
              o._id === orderId ? { ...o, status } : o
            );
          }
          return [order, ...prev];
        });
      } else {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      }
    },
    []
  );

  useSocket(handleNewOrder, handleStatusUpdated);

  const handlePickup = async (order: Order) => {
    setLoadingIds((prev) => new Set(prev).add(order._id));
    try {
      await updateOrderStatus(order._id, "PICKED_UP");
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
    } catch (err) {
      console.error("Pickup failed", err);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(order._id);
        return next;
      });
    }
  };

  const readyOrders = orders.filter((o) => o.status === "READY");
  const pendingOrders = orders.filter((o) => o.status !== "READY");

  return {
    orders,
    readyOrders,
    pendingOrders,
    loadingIds,
    lastUpdated,
    fetchOrders,
    handlePickup,
  };
}