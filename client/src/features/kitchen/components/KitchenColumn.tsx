import { useDroppable } from "@dnd-kit/core";
import type { KitchenStatus } from "../config/kitchen.contant";
import type { OrderStatus, Order } from "@/features/kiosk/types/order.types";
import { STATUS_CONFIG } from "../config/kitchen.contant";
import { OrderCard } from "./OrderCard";
import { UtensilsCrossed, Flame, PackageCheck } from "lucide-react";

const COL_ICON: Record<KitchenStatus, React.ReactNode> = {
  CREATED: <UtensilsCrossed className="w-3.5 h-3.5" />,
  IN_KITCHEN: <Flame className="w-3.5 h-3.5" />,
  READY: <PackageCheck className="w-3.5 h-3.5" />,
};

const COL_THEME: Record<
  KitchenStatus,
  {
    headerIcon: string;
    headerText: string;
    headerBg: string;
    headerBorder: string;
    countBadge: string;
    ring: string;
    overBg: string;
    emptyBorder: string;
    emptyText: string;
    emptyIcon: string;
  }
> = {
  CREATED: {
    headerIcon: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/15",
    headerText: "text-amber-800 dark:text-amber-300",
    headerBg: "bg-amber-50 dark:bg-amber-400/[0.08]",
    headerBorder: "border-amber-200 dark:border-amber-400/20",
    countBadge: "bg-amber-500 text-white",
    ring: "ring-amber-400/50",
    overBg: "bg-amber-50/50 dark:bg-amber-400/[0.05]",
    emptyBorder: "border-amber-200/60 dark:border-amber-400/15",
    emptyText: "text-amber-400 dark:text-amber-500/50",
    emptyIcon: "text-amber-300 dark:text-amber-400/30",
  },
  IN_KITCHEN: {
    headerIcon: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-400/15",
    headerText: "text-indigo-800 dark:text-indigo-300",
    headerBg: "bg-indigo-50 dark:bg-indigo-400/[0.08]",
    headerBorder: "border-indigo-200 dark:border-indigo-400/20",
    countBadge: "bg-indigo-500 text-white",
    ring: "ring-indigo-400/50",
    overBg: "bg-indigo-50/50 dark:bg-indigo-400/[0.05]",
    emptyBorder: "border-indigo-200/60 dark:border-indigo-400/15",
    emptyText: "text-indigo-400 dark:text-indigo-500/50",
    emptyIcon: "text-indigo-300 dark:text-indigo-400/30",
  },
  READY: {
    headerIcon: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/15",
    headerText: "text-emerald-800 dark:text-emerald-300",
    headerBg: "bg-emerald-50 dark:bg-emerald-400/[0.08]",
    headerBorder: "border-emerald-200 dark:border-emerald-400/20",
    countBadge: "bg-emerald-500 text-white",
    ring: "ring-emerald-400/50",
    overBg: "bg-emerald-50/50 dark:bg-emerald-400/[0.05]",
    emptyBorder: "border-emerald-200/60 dark:border-emerald-400/15",
    emptyText: "text-emerald-400 dark:text-emerald-500/50",
    emptyIcon: "text-emerald-300 dark:text-emerald-400/30",
  },
};

export function Column({
  status,
  orders,
  onAction,
  loadingIds,
  isDragging,
}: {
  status: KitchenStatus;
  orders: Order[];
  onAction: (order: Order, next: OrderStatus) => void;
  loadingIds: Set<string>;
  isDragging: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const cfg = STATUS_CONFIG[status];
  const theme = COL_THEME[status];

  return (
    <div className="flex flex-col gap-2 min-w-0 h-full">
      {/* sticky column header */}
      <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${theme.headerBg} ${theme.headerBorder}`}>
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${theme.headerIcon}`}>
          {COL_ICON[status]}
        </span>
        <span className={`text-sm font-bold tracking-tight ${theme.headerText}`}>{cfg.label}</span>
        <span
          className={`ml-auto min-w-5 h-5 px-1.5 rounded-full text-[11px] font-black flex items-center justify-center ${theme.countBadge}`}
        >
          {orders.length}
        </span>
      </div>

      {/* droppable card area */}
      <div
        ref={setNodeRef}
        className={[
          "flex flex-col gap-2.5 flex-1 overflow-y-auto rounded-xl p-2 transition-all duration-150 min-h-32",
          isOver
            ? `ring-2 ring-inset ${theme.ring} ${theme.overBg}`
            : isDragging
              ? "ring-1 ring-inset ring-slate-200/70 dark:ring-white/6"
              : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {orders.length === 0 ? (
          <div
            className={[
              "flex-1 flex flex-col items-center justify-center py-14 rounded-xl border-2 border-dashed transition-all",
              isOver
                ? `${theme.ring.replace("ring-", "border-")} ${theme.overBg}`
                : theme.emptyBorder,
            ].join(" ")}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${theme.headerBg} border ${theme.headerBorder}`}>
              <span className={theme.emptyIcon}>{COL_ICON[status]}</span>
            </div>
            <p className={`text-xs font-semibold ${theme.emptyText}`}>
              {isOver ? `Drop to move here` : "No orders yet"}
            </p>
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

        {/* drop pad at bottom when there are existing cards */}
        {isDragging && orders.length > 0 && (
          <div
            className={`h-14 rounded-xl border-2 border-dashed transition-all duration-150 flex items-center justify-center gap-2 ${
              isOver
                ? `${theme.ring.replace("ring-", "border-")} ${theme.overBg}`
                : theme.emptyBorder
            }`}
          >
            <span className={`text-[11px] font-semibold ${theme.emptyText}`}>
              {isOver ? `✓ Release to move` : `Drop here`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
