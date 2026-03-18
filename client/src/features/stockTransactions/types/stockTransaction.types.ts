export interface StockTransaction {
  _id: string;
  sourceType?: "INGREDIENT" | "MENU_ITEM";
  ingredientId?: string | { _id: string; name: string; unit: string } | null;
  menuItemId?: string | { _id: string; name: string } | null;
  type: "PURCHASE" | "CONSUMPTION" | "WASTAGE" | "ADJUSTMENT";
  quantity: number;
  referenceType: "ORDER" | "MANUAL";
  referenceId: string | null;
  note: string;
  franchiseId: string;
  outletId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManualTransactionPayload {
  sourceType: "INGREDIENT" | "MENU_ITEM";
  itemId: string;
  type: "PURCHASE" | "WASTAGE" | "ADJUSTMENT";
  quantity: number;
  note?: string;
}

export interface StockTransactionStats {
  totalTransactions: number;
  purchaseCount: number;
  consumptionCount: number;
  wastageCount: number;
  adjustmentCount: number;
}

export type StockTransactionSortBy = "createdAt" | "type" | "quantity";
export type StockTransactionSortOrder = "asc" | "desc";
