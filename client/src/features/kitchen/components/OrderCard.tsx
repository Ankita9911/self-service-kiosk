import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Clock, ArrowRight } from "lucide-react";
import type { Order, OrderStatus } from "@/features/kiosk/types/order.types";
import type { KitchenStatus } from "../config/kitchen.constants";
import { STATUS_CONFIG } from "../config/kitchen.constants";
import { formatTime, elapsedMinutes } from "@/shared/utils/commonFunction";

const CARD_THEME: Record<
  KitchenStatus,
  {
    accent: string;
    badge: string;
    badgeDot: string;
    badgeTxt: string;
    btn: string;
    btnHover: string;
    itemRowBg: string;
  }
> = {
  CREATED: {
    accent: "bg-amber-400",
    badge:
      "bg-amber-50 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20 text-amber-700 dark:text-amber-300",
    badgeDot: "bg-amber-400",
    badgeTxt: "New Order",
    btn: "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 dark:shadow-amber-400/10",
    btnHover: "hover:shadow-amber-500/30",
    itemRowBg: "bg-amber-50/70 dark:bg-amber-400/[0.07]",
  },
  IN_KITCHEN: {
    accent: "bg-indigo-500",
    badge:
      "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-400/20 text-indigo-700 dark:text-indigo-300",
    badgeDot: "bg-indigo-500 animate-pulse",
    badgeTxt: "Preparing",
    btn: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-400/10",
    btnHover: "hover:shadow-indigo-500/30",
    itemRowBg: "bg-indigo-50/70 dark:bg-indigo-400/[0.07]",
  },
  READY: {
    accent: "bg-emerald-500",
    badge:
      "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-400/20 text-emerald-700 dark:text-emerald-300",
    badgeDot: "bg-emerald-500 animate-pulse",
    badgeTxt: "Ready",
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 dark:shadow-emerald-400/10",
    btnHover: "hover:shadow-emerald-500/30",
    itemRowBg: "bg-emerald-50/70 dark:bg-emerald-400/[0.07]",
  },
};

export function OrderCard({
  order,
  onAction,
  loading = false,
  overlay = false,
}: {
  order: Order;
  onAction?: (order: Order, next: OrderStatus) => void;
  loading?: boolean;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: order._id,
    data: { order },
    disabled: overlay,
  });

  const status = order.status as KitchenStatus;
  const cfg = STATUS_CONFIG[status];
  const theme = CARD_THEME[status];
  const elapsed = elapsedMinutes(order.createdAt);

  const elapsedColor =
    elapsed >= 15
      ? "text-red-500 dark:text-red-400"
      : elapsed >= 8
        ? "text-amber-500 dark:text-amber-400"
        : "text-slate-400 dark:text-slate-500";

  return (
    <article
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : attributes)}
      className={[
        "group relative bg-white dark:bg-[#1e2130] rounded-2xl border border-slate-100 dark:border-white/[0.07]",
        "shadow-sm transition-all duration-200 overflow-hidden select-none",
        overlay
          ? "shadow-2xl scale-[1.03] rotate-2 ring-2 ring-indigo-400/20"
          : [
              isDragging
                ? "opacity-30 scale-[0.98]"
                : "opacity-100 hover:shadow-md hover:-translate-y-px",
              loading ? "pointer-events-none opacity-60" : "",
            ].join(" "),
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* top accent stripe */}
      <div className={`h-0.75 w-full ${theme.accent}`} />

      {/* drag handle strip — apply dnd listeners here only */}
      <div
        {...(overlay ? {} : listeners)}
        className={`flex items-center gap-1.5 px-3 pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing group/handle`}
      >
        <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover/handle:text-slate-400 dark:group-hover/handle:text-slate-400 transition-colors" />
        <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-300 dark:text-slate-600 group-hover/handle:text-slate-400 dark:group-hover/handle:text-slate-400 transition-colors">
          Drag to move
        </span>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-3">
        {/* header row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-none">
              #{order.orderNumber}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.badgeDot}`}
              />
              <span
                className={`text-[11px] font-semibold border px-2 py-0.5 rounded-full ${theme.badge}`}
              >
                {theme.badgeTxt}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0 pt-0.5">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {formatTime(order.createdAt)}
            </p>
            <div
              className={`flex items-center justify-end gap-1 mt-1 text-[11px] font-bold ${elapsedColor}`}
            >
              <Clock className="w-3 h-3" />
              {elapsed}m
            </div>
          </div>
        </div>

        {/* items list */}
        <div
          className={`rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 ${theme.itemRowBg}`}
        >
          {order.items.map((item, i) => (
            <div
              key={i}
              className={`flex items-baseline justify-between gap-2 px-3 py-1.5 ${
                i > 0 ? "border-t border-slate-100 dark:border-white/5" : ""
              }`}
            >
              <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                <span className="font-black text-slate-900 dark:text-white mr-1">
                  {item.quantity}×
                </span>
                {item.nameSnapshot}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                ₹{item.lineTotal.toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/7 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
            {order.paymentMethod}
          </span>
          <span className="text-base font-black text-slate-800 dark:text-white">
            ₹{order.totalAmount.toFixed(0)}
          </span>
        </div>

        {/* action button */}
        {cfg.next && onAction && (
          <button
            onClick={() => onAction(order, cfg.next!)}
            disabled={loading}
            className={`
              w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold
              transition-all active:scale-[0.97] ${theme.btn} ${theme.btnHover}
            `}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Updating…
              </span>
            ) : (
              <>
                {cfg.nextLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
