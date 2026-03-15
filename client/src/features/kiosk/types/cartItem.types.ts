import type { OfferType } from "./menu.types";

export interface CartItem {
  cartItemId: string;
  itemId: string;
  name: string;
  price: number; // original price
  quantity: number;
  stockQuantity: number;
  offerType?: OfferType;
  discountPercent?: number; // for DISCOUNT type
  isCombo?: boolean; // true for combo items
  selectedCustomizations?: {
    itemId: string;
    name: string;
    price: number;
    stockQuantity: number;
  }[];
}
