export type OrderStatus =
  | "CREATED"
  | "IN_KITCHEN"
  | "READY"
  | "COMPLETED"
  | "PICKED_UP";

export type PaymentMethod = "CASH" | "CARD" | "UPI";

export interface OrderItem {
  itemId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  lineTotal: number;
  customizations?: {
    itemId: string;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    lineTotal: number;
  }[];
}

export interface Order {
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
