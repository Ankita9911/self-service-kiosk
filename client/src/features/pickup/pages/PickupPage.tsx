import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { usePickup } from "../hooks/usePickup";
import { PickupTopBar } from "../components/PickupTopBar";
import { PickupTabs } from "../components/PickupTabs";
import { PickupEmptyState } from "../components/PickupEmptyState";
import { PickupOrderGrid } from "../components/PickupOrderGrid";
import type { Order } from "@/features/kiosk/types/order.types";

function SectionHeader({
  title, count, accent,
}: {
  title: string;
  count: number;
  accent: string;
}) {
  return (
    <div className={`flex items-center gap-2 mb-3 ${accent}`}>
      <span className="text-sm font-bold">{title}</span>
      <span className="text-xs font-black bg-current/10 px-1.5 py-0.5 rounded-full">{count}</span>
      <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
    </div>
  );
}

function sortByTime(a: Order, b: Order) {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

export default function PickupPage() {
  const { orders, readyOrders, pendingOrders, loadingIds, lastUpdated, fetchOrders, handlePickup } =
    usePickup();

  const [tab, setTab] = useState<"READY" | "ALL">("READY");

  const sortedReady = [...readyOrders].sort(sortByTime);
  const sortedPending = [...pendingOrders].sort(sortByTime);
  const sortedAll = [...sortedReady, ...sortedPending];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f1117]">
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

      <div className="flex-1 overflow-y-auto p-5">
        {tab === "READY" ? (
          sortedReady.length === 0 ? (
            <PickupEmptyState type="READY" />
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-400/8 border border-emerald-200 dark:border-emerald-400/20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {sortedReady.length} {sortedReady.length === 1 ? "order" : "orders"} waiting for pickup
                </p>
              </div>
              <PickupOrderGrid orders={sortedReady} onPickup={handlePickup} loadingIds={loadingIds} />
            </>
          )
        ) : sortedAll.length === 0 ? (
          <PickupEmptyState type="ALL" />
        ) : (
          <div className="flex flex-col gap-8">
            {sortedReady.length > 0 && (
              <section>
                <SectionHeader
                  title="Ready for Pickup"
                  count={sortedReady.length}
                  accent="text-emerald-600 dark:text-emerald-400"
                />
                <PickupOrderGrid orders={sortedReady} onPickup={handlePickup} loadingIds={loadingIds} />
              </section>
            )}
            {sortedPending.length > 0 && (
              <section>
                <SectionHeader
                  title="Preparing in Kitchen"
                  count={sortedPending.length}
                  accent="text-amber-600 dark:text-amber-400"
                />
                <PickupOrderGrid orders={sortedPending} onPickup={handlePickup} loadingIds={loadingIds} />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
