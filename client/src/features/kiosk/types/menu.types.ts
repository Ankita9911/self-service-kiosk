export type {
  OfferType,
  ItemOffer,
  ServiceType,
  InventoryMode,
} from "@/shared/types/menu.types";

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
  inventoryMode?: import("@/shared/types/menu.types").InventoryMode;
  isActive: boolean;
  serviceType?: import("@/shared/types/menu.types").ServiceType;
  offers?: import("@/shared/types/menu.types").ItemOffer[];
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
  serviceType: import("@/shared/types/menu.types").ServiceType;
  isActive: boolean;
}
