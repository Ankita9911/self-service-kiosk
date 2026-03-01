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

export type ItemFormState = {
  categoryId: string;
  name: string;
  description: string;
  imageFile: File | null;
  price: string;
  stockQuantity: string;
};