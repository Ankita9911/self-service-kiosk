export interface OutletAddress {
  line1?:   string;
  city?:    string;
  state?:   string;
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

export type ServiceType = "DINE_IN" | "TAKE_AWAY" | "BOTH";

export type OfferType = "DISCOUNT" | "BOGO" | "NEW" | "BESTSELLER" | "LIMITED";

export interface ItemOfferForm {
  type: OfferType;
  discountPercent?: number;
  label?: string;
}

export type ItemFormState = {
  categoryId: string;
  name: string;
  description: string;
  imageFile: File | null;
  price: string;
  stockQuantity: string;
  serviceType: ServiceType;
  offers: ItemOfferForm[];
  customizationItemIds: string[];
};

export type CategoryFormState = {
  name: string;
  description: string;
  imageFile: File | null;
  imageUrl: string | undefined;
};
