export interface Category {
  _id: string;
  name: string;
  description?: string;
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
}

export interface MenuCategory {
  _id: string;
  name: string;
  displayOrder?: number;
  items: MenuItem[];
}
