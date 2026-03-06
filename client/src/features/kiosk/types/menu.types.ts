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
  isActive: boolean;
  serviceType?: "DINE_IN" | "TAKE_AWAY" | "BOTH";
  offers?: ItemOffer[];
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
