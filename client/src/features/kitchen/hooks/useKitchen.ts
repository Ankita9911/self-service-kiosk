import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "@/features/kiosk/services/order.service";
import { useSocket } from "@/shared/hooks/useSocket";
import type { Order, OrderStatus } from "@/features/kiosk/types/order.types";
import { COLUMN_ORDER } from "../config/kitchen.constants";
import type { KitchenStatus } from "../config/kitchen.constants";

export function useKitchen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders(["CREATED", "IN_KITCHEN", "READY"]);
      setOrders(data);
      setLastUpdated(new Date());
    } catch {
      // axios interceptor handles error toasts
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleNewOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      if (prev.find((o) => o._id === order._id)) return prev;
      return [order, ...prev];
    });
  }, []);

  const handleStatusUpdated = useCallback(
    ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      if (status === "PICKED_UP" || status === "COMPLETED") {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status } : o))
        );
      }
    },
    []
  );

  useSocket(handleNewOrder, handleStatusUpdated);

  const handleAction = async (order: Order, next: OrderStatus) => {
    setLoadingIds((prev) => new Set(prev).add(order._id));
    try {
      const updated = await updateOrderStatus(order._id, next);
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
    } catch {
      // axios interceptor handles error toasts
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(order._id);
        return next;
      });
    }
  };

  const grouped = COLUMN_ORDER.reduce<Record<KitchenStatus, Order[]>>(
    (acc, s) => {
      acc[s] = orders.filter((o) => o.status === s);
      return acc;
    },
    { CREATED: [], IN_KITCHEN: [], READY: [] }
  );

  return {
    grouped,
    loadingIds,
    lastUpdated,
    totalActive: orders.length,
    fetchOrders,
    handleAction,
  };
}
