import { useState } from "react";
import { usePickup } from "../hooks/usePickup";
import { PickupTopBar } from "../components/PickupTopBar";
import { PickupTabs } from "../components/PickupTabs";
import { PickupCard } from "../components/PickupCard";

export default function PickupPage() {
  const {
    orders,
    readyOrders,
    pendingOrders,
    loadingIds,
    lastUpdated,
    fetchOrders,
    handlePickup,
  } = usePickup();

  const [tab, setTab] = useState<"READY" | "ALL">("READY");

  const displayedOrders = tab === "READY" ? readyOrders : orders;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <PickupTopBar
        readyCount={readyOrders.length}
        pendingCount={pendingOrders.length}
        lastUpdated={lastUpdated}
        onRefresh={fetchOrders}
      />

      <PickupTabs
        tab={tab}
        readyCount={readyOrders.length}
        totalCount={orders.length}
        onChange={setTab}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-4">
              {tab === "READY" ? "✓" : "📋"}
            </div>
            <p className="text-lg font-medium">
              {tab === "READY"
                ? "No orders ready yet"
                : "No active orders"}
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
                if (a.status === "READY" && b.status !== "READY") return -1;
                if (b.status === "READY" && a.status !== "READY") return 1;
                return (
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
                );
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