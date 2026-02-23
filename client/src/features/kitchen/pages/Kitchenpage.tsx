import { COLUMN_ORDER } from "../config/kitchen.contant";
import { useKitchen } from "../hooks/useKitchen";
import { KitchenTopBar } from "../components/KitchenTopBar";
import { Column } from "../components/KitchenColumn";

export default function KitchenPage() {
  const {
    grouped,
    loadingIds,
    lastUpdated,
    totalActive,
    fetchOrders,
    handleAction,
  } = useKitchen();

  return (
    <div className="flex flex-col h-full bg-gray-50">
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
          />
        ))}
      </div>
    </div>
  );
}