import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "@/services/order.service";
import { useSocket } from "@/shared/hooks/useSocket";
import type { Order, OrderStatus } from "@/shared/types/order.types";
import { cn } from "@/shared/lib/utils";

// ─── Status config ────────────────────────────────────────────────────────────

type KitchenStatus = "CREATED" | "IN_KITCHEN" | "READY";

const STATUS_CONFIG: Record<
  KitchenStatus,
  { label: string; color: string; bg: string; border: string; next: OrderStatus | null; nextLabel: string }
> = {
  CREATED: {
    label: "New Order",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    next: "IN_KITCHEN",
    nextLabel: "Accept & Start Preparing",
  },
  IN_KITCHEN: {
    label: "Preparing",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
    next: "READY",
    nextLabel: "Mark as Ready",
  },
  READY: {
    label: "Ready for Pickup",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-300",
    next: null,
    nextLabel: "",
  },
};

const COLUMN_ORDER: KitchenStatus[] = ["CREATED", "IN_KITCHEN", "READY"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function elapsedMinutes(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({
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

// ─── Column ───────────────────────────────────────────────────────────────────

function Column({
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
      {/* Column header */}
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

      {/* Cards */}
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

// ─── KitchenPage ──────────────────────────────────────────────────────────────

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders(["CREATED", "IN_KITCHEN", "READY"]);
      setOrders(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // fallback poll every 30s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Socket handlers
  const handleNewOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      // avoid duplicates
      if (prev.find((o) => o._id === order._id)) return prev;
      return [order, ...prev];
    });
  }, []);

  const handleStatusUpdated = useCallback(
    ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      if (status === "PICKED_UP" || status === "COMPLETED") {
        // Remove from kitchen view
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
    } catch (err) {
      console.error("Status update failed", err);
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

  const totalActive = orders.length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <h1 className="text-xl font-bold text-gray-900">Kitchen Display</h1>
          {totalActive > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalActive} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-400">
            Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <button
            onClick={fetchOrders}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
        {COLUMN_ORDER.map((status) => (
          <Column
            key={status}
            status={status}
            orders={grouped[status]}
            onAction={handleAction}
            loadingIds={loadingIds}
          />
        ))}
      </div>
    </div>
  );
}