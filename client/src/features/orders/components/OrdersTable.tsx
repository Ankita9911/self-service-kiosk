import { ShoppingCart } from "lucide-react";
import { Shimmer, ShimmerCell } from "@/shared/components/ui/ShimmerCell";
import { CursorPagination } from "@/shared/components/ui/CursorPagination";
import type { OrderHistoryItem } from "../types/order.types";

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  CREATED:    { dot: "bg-amber-400",   text: "text-amber-700 dark:text-amber-300",   bg: "bg-amber-50 dark:bg-amber-400/10"   },
  IN_KITCHEN: { dot: "bg-indigo-500",  text: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-50 dark:bg-indigo-400/10" },
  READY:      { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-400/10" },
  PICKED_UP:  { dot: "bg-slate-400",   text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-100 dark:bg-white/6"       },
  COMPLETED:  { dot: "bg-slate-400",   text: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-100 dark:bg-white/6"       },
};

const PAYMENT_STYLES: Record<string, string> = {
  CASH: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
  CARD: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10",
  UPI:  "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10",
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.CREATED;
  const label = status.replace("_", " ");
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-transparent ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
      {label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrdersTableProps {
  orders: OrderHistoryItem[];
  loading: boolean;
  filterLoading: boolean;
  totalMatching: number;
  page: number;
  pageSize: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (size: number) => void;
  onViewOrder: (order: OrderHistoryItem) => void;
}

const TABLE_HEADERS = ["Order", "Items", "Amount", "Payment", "Status", "Date"];

export function OrdersTable({
  orders,
  loading,
  filterLoading,
  totalMatching,
  page,
  pageSize,
  hasPrevPage,
  hasNextPage,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
  onViewOrder,
}: OrdersTableProps) {
  return (
    <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
            {TABLE_HEADERS.map((h) => (
              <th
                key={h}
                className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={`divide-y divide-slate-50 dark:divide-white/4 ${filterLoading ? "opacity-60 pointer-events-none" : ""}`}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <ShimmerCell w="w-20" />
                <ShimmerCell w="w-32" />
                <ShimmerCell w="w-16" />
                <ShimmerCell w="w-14" />
                <td className="px-5 py-4"><Shimmer w="w-24" h="h-6" rounded="rounded-full" /></td>
                <ShimmerCell w="w-28" />
              </tr>
            ))
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="font-medium text-slate-600 dark:text-slate-300">No orders found</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">Try adjusting your filters</p>
                </div>
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order._id}
                onClick={() => onViewOrder(order)}
                className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors cursor-pointer"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-800 dark:text-white">
                      #{order.orderNumber}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col gap-0.5 max-w-[200px]">
                    {order.items.slice(0, 2).map((item, i) => (
                      <span key={i} className="text-[12px] text-slate-600 dark:text-slate-400 truncate">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.quantity}×</span> {item.nameSnapshot}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        +{order.items.length - 2} more
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="text-[13px] font-semibold text-slate-800 dark:text-white font-mono">
                    ₹{order.totalAmount.toFixed(0)}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${PAYMENT_STYLES[order.paymentMethod] ?? ""}`}>
                    {order.paymentMethod}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={order.status} />
                </td>

                <td className="px-5 py-4 text-[12px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && orders.length > 0 && (
        <CursorPagination
          total={totalMatching}
          page={page}
          pageSize={pageSize}
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
