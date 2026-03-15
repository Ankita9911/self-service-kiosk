import { AlertTriangle } from "lucide-react";

interface IngredientStockBadgeProps {
  currentStock: number;
  minThreshold: number;
}

export function IngredientStockBadge({
  currentStock,
  minThreshold,
}: IngredientStockBadgeProps) {
  const isLow = currentStock < minThreshold;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
        isLow
          ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
      }`}
    >
      {isLow && <AlertTriangle className="w-3 h-3" />}
      {isLow ? "Low Stock" : "In Stock"}
    </span>
  );
}
