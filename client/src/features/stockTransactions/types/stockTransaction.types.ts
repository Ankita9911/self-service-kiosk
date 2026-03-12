export interface StockTransaction {
  _id: string;
  ingredientId: string | { _id: string; name: string; unit: string };
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
  ingredientId: string;
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
