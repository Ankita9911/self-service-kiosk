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
}
