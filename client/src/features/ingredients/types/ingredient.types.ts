export interface Ingredient {
  _id: string;
  name: string;
  unit: "gram" | "ml" | "piece" | "kg" | "liter" | "dozen";
  currentStock: number;
  minThreshold: number;
  franchiseId: string;
  outletId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientFormState {
  name: string;
  unit: "gram" | "ml" | "piece" | "kg" | "liter" | "dozen";
  currentStock: number;
  minThreshold: number;
}

export interface StockAdjustPayload {
  type: "PURCHASE" | "WASTAGE" | "ADJUSTMENT";
  quantity: number;
  note?: string;
}
