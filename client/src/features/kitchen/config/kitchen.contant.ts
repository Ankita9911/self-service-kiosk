import type { OrderStatus } from "@/features/kiosk/types/order.types";

export type KitchenStatus = "CREATED" | "IN_KITCHEN" | "READY";

export const COLUMN_ORDER: KitchenStatus[] = [
  "CREATED",
  "IN_KITCHEN",
  "READY",
];

export const STATUS_CONFIG: Record<
  KitchenStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    next: OrderStatus | null;
    nextLabel: string;
  }
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