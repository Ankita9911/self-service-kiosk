export type ServiceType = "DINE_IN" | "TAKE_AWAY" | "BOTH";

export type InventoryMode = "RECIPE" | "DIRECT";

export type OfferType = "DISCOUNT" | "BOGO" | "NEW" | "BESTSELLER" | "LIMITED";

export interface ItemOffer {
  type: OfferType;
  discountPercent?: number;
  label?: string;
}
