export type OfferType = "DISCOUNT" | "BOGO" | "NEW" | "BESTSELLER" | "LIMITED";

export interface ItemOffer {
  type: OfferType;
  discountPercent?: number;
  label?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  _id: string;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  stockQuantity: number;
  inventoryMode?: "RECIPE" | "DIRECT";
  isActive: boolean;
  serviceType?: "DINE_IN" | "TAKE_AWAY" | "BOTH";
  offers?: ItemOffer[];
  stockSource?: "MENU" | "RECIPE";
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "NO_RECIPE";
  availableQuantity?: number | null;
  customizationItemIds?: string[];
  customizationOptions?: {
    itemId: string;
    name: string;
    price: number;
    stockQuantity: number;
  }[];
}

export interface MenuCategory {
  _id: string;
  name: string;
  imageUrl?: string;
  displayOrder?: number;
  items: MenuItem[];
}

export interface ComboItem {
  menuItemId: string;
  name: string;
  quantity: number;
}

export interface Combo {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  items: ComboItem[];
  originalPrice: number;
  comboPrice: number;
  serviceType: "DINE_IN" | "TAKE_AWAY" | "BOTH";
  isActive: boolean;
}
