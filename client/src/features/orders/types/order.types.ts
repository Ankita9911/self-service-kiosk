import type { OrderStatus, PaymentMethod, OrderItem } from "@/features/kiosk/types/order.types";

export type { OrderStatus, PaymentMethod, OrderItem };

export type OrderPeriod = "today" | "yesterday" | "7d" | "30d" | "90d";

export interface OrderHistoryItem {
  _id: string;
  franchiseId: string;
  outletId: string;
  orderNumber: number;
  clientOrderId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "PENDING" | "SUCCESS";
  status: OrderStatus;
  createdByRole: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistoryFilters {
  period: OrderPeriod;
  date: string;
  status: OrderStatus | "ALL";
  paymentMethod: PaymentMethod | "ALL";
  search: string;
  franchiseId: string;
  outletId: string;
}

export interface OrderStatusBreakdown {
  count: number;
  revenue: number;
}

export interface OrderPaymentBreakdown {
  count: number;
  revenue: number;
}

export interface OrderTopItem {
  _id: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
  orderCount: number;
}

export interface OrderTopCategory {
  _id: string;
  categoryName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface OrderOutletBreakdown {
  outletId: string;
  name: string;
  outletCode: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface OrderHourlyData {
  _id: number;  // local hour 0–23
  count: number;
  revenue: number;
}

export interface OrderTrendData {
  _id: string;
  count: number;
  revenue: number;
}

export interface OrderSummary {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  minOrderValue: number;
  maxOrderValue: number;
  peakHour: number | null;
}

export interface OrderStats {
  summary: OrderSummary;
  statusBreakdown: Record<string, OrderStatusBreakdown>;
  paymentBreakdown: Record<string, OrderPaymentBreakdown>;
  ordersPerHour: OrderHourlyData[];
  trend: OrderTrendData[];
  isDateSpecific: boolean;
  topItems?: OrderTopItem[];
  topCategories?: OrderTopCategory[];
  outletBreakdown?: OrderOutletBreakdown[];
}
