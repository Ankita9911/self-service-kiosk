import type { StockTransaction } from "../types/stockTransaction.types";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function qtyDisplay(
  txn: Pick<StockTransaction, "type" | "quantity">,
): string {
  if (txn.type === "PURCHASE") return `+${Math.abs(txn.quantity)}`;
  if (txn.type === "ADJUSTMENT")
    return txn.quantity > 0 ? `+${txn.quantity}` : String(txn.quantity);
  return `-${Math.abs(txn.quantity)}`;
}

export function qtyColor(
  txn: Pick<StockTransaction, "type" | "quantity">,
): string {
  if (txn.type === "PURCHASE") return "text-emerald-600 dark:text-emerald-400";
  if (txn.type === "ADJUSTMENT")
    return txn.quantity >= 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-500 dark:text-red-400";
  return "text-red-500 dark:text-red-400";
}

export function shortUnit(unit?: string): string {
  const map: Record<string, string> = {
    gram: "g",
    ml: "ml",
    piece: "pc",
    kg: "kg",
    liter: "L",
    dozen: "dz",
  };
  return unit ? (map[unit] ?? unit) : "";
}
