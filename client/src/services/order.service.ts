import axiosInstance from "./axiosInstance";
import type { Order, OrderStatus } from "@/types/order.types";

export async function getOrders(statuses?: OrderStatus[]): Promise<Order[]> {
  const params = statuses?.length
    ? { params: { statuses: statuses.join(",") } }
    : {};
  const response = await axiosInstance.get<{ data: Order[] }>("/orders", params);
  return response.data.data;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const response = await axiosInstance.patch<{ data: Order }>(
    `/orders/${orderId}/status`,
    { status }
  );
  return response.data.data;
}