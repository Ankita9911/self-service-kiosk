import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "@/services/order.service";
import { useSocket } from "@/hooks/useSocket";
import type { Order, OrderStatus } from "@/types/order.types";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function elapsedMinutes(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

// ─── PickupCard ───────────────────────────────────────────────────────────────

function PickupCard({
  order,
  onPickup,
  loading,
}: {
  order: Order;
  onPickup: (order: Order) => void;
  loading: boolean;
}) {
  const elapsed = elapsedMinutes(order.createdAt);
  const isReady = order.status === "READY";

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-5 flex flex-col gap-4 shadow-sm transition-all",
        isReady
          ? "bg-green-50 border-green-300"
          : "bg-amber-50 border-amber-200",
        loading && "opacity-60 pointer-events-none"
      )}
    >
      {/* Header */}
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
                  : "text-gray-500"
              )}
            >
              {elapsed}m waiting
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium">{order.paymentMethod}</p>
          <p className="text-lg font-bold text-gray-800 mt-0.5">
            ₹{order.totalAmount.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Items summary */}
      <div className="bg-white/70 rounded-xl p-3 flex flex-col gap-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-700">
              <span className="font-bold">{item.quantity}×</span> {item.nameSnapshot}
            </span>
            <span className="text-gray-500">₹{item.lineTotal.toFixed(0)}</span>
          </div>
        ))}
      </div>

      {/* Pickup button — only when READY */}
      {isReady ? (
        <button
          onClick={() => onPickup(order)}
          disabled={loading}
          className={cn(
            "w-full py-3 rounded-xl text-base font-bold transition-all",
            "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg active:scale-95",
            loading && "cursor-not-allowed opacity-70"
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

// ─── PickupPage ───────────────────────────────────────────────────────────────

export default function PickupPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [tab, setTab] = useState<"READY" | "ALL">("READY");

  const fetchOrders = useCallback(async () => {
    try {
      // Pickup staff sees orders that are READY or still IN_KITCHEN (coming soon)
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

  // Socket handlers
  const handleNewOrder = useCallback((_order: Order) => {
    // Pickup screen doesn't care about brand new CREATED orders yet
  }, []);

  const handleStatusUpdated = useCallback(
    ({ orderId, status, order }: { orderId: string; status: OrderStatus; order: Order }) => {
      if (status === "PICKED_UP" || status === "COMPLETED") {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else if (status === "READY" || status === "IN_KITCHEN") {
        // Update or insert into pickup view
        setOrders((prev) => {
          const exists = prev.find((o) => o._id === orderId);
          if (exists) {
            return prev.map((o) => (o._id === orderId ? { ...o, status } : o));
          } else {
            return [order, ...prev];
          }
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
      // Socket event will remove it; also remove locally for instant feedback
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
    } catch (err) {
      console.error("Pickup failed", err);
    } finally {
      setLoadingIds((prev) => {
        const n = new Set(prev);
        n.delete(order._id);
        return n;
      });
    }
  };

  const readyOrders = orders.filter((o) => o.status === "READY");
  const pendingOrders = orders.filter((o) => o.status !== "READY");
  const displayedOrders = tab === "READY" ? readyOrders : orders;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <h1 className="text-xl font-bold text-gray-900">Pickup Counter</h1>
          {readyOrders.length > 0 && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {readyOrders.length} ready
            </span>
          )}
          {pendingOrders.length > 0 && (
            <span className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingOrders.length} coming
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-400">
            Updated{" "}
            {lastUpdated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <button
            onClick={fetchOrders}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6 flex gap-4">
        <button
          onClick={() => setTab("READY")}
          className={cn(
            "py-3 text-sm font-semibold border-b-2 transition-colors",
            tab === "READY"
              ? "border-green-500 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Ready for Pickup
          {readyOrders.length > 0 && (
            <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {readyOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("ALL")}
          className={cn(
            "py-3 text-sm font-semibold border-b-2 transition-colors",
            tab === "ALL"
              ? "border-blue-500 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          All Active
          {orders.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {orders.length}
            </span>
          )}
        </button>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-4">
              {tab === "READY" ? "✓" : "📋"}
            </div>
            <p className="text-lg font-medium">
              {tab === "READY" ? "No orders ready yet" : "No active orders"}
            </p>
            <p className="text-sm mt-1">
              {tab === "READY"
                ? "Kitchen is still preparing..."
                : "Waiting for new orders from kiosk"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedOrders
              .sort((a, b) => {
                // READY first, then by time
                if (a.status === "READY" && b.status !== "READY") return -1;
                if (b.status === "READY" && a.status !== "READY") return 1;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              })
              .map((order) => (
                <PickupCard
                  key={order._id}
                  order={order}
                  onPickup={handlePickup}
                  loading={loadingIds.has(order._id)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}