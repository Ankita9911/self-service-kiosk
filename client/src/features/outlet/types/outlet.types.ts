export type {
  ServiceType,
  InventoryMode,
  OfferType,
  ItemOffer,
} from "@/shared/types/menu.types";

export interface OutletAddress {
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface Outlet {
  _id: string;
  franchiseId: string;
  name: string;
  outletCode: string;
  address?: OutletAddress;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemOfferForm {
  type: import("@/shared/types/menu.types").OfferType;
  discountPercent?: number;
  label?: string;
}

export type ItemFormState = {
  categoryId: string;
  name: string;
  description: string;
  imageUrl?: string;
  imageFile: File | null;
  price: string;
  stockQuantity: string;
  inventoryMode: import("@/shared/types/menu.types").InventoryMode;
  serviceType: import("@/shared/types/menu.types").ServiceType;
  offers: ItemOfferForm[];
  customizationItemIds: string[];
};

export type CategoryFormState = {
  name: string;
  description: string;
  imageFile: File | null;
  imageUrl: string | undefined;
};
