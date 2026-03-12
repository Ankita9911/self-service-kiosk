import { ArrowUpDown, Pencil, Trash2, Package, AlertTriangle } from "lucide-react";
import type { Ingredient } from "@/features/ingredients/types/ingredient.types";
import { Button } from "@/shared/components/ui/button";

const UNIT_LABELS: Record<string, string> = { gram: "g", ml: "ml", piece: "pcs" };

interface Props {
  ingredients: Ingredient[];
  loading: boolean;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: string) => void;
  onAdjustStock: (ingredient: Ingredient) => void;
}

export function IngredientTable({ ingredients, loading, onEdit, onDelete, onAdjustStock }: Props) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1e2130] rounded-2xl border border-slate-100 dark:border-white/[0.06] p-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
        <p className="text-sm text-slate-400 mt-3">Loading ingredients…</p>
      </div>
    );
  }

  if (!ingredients.length) {
    return (
      <div className="bg-white dark:bg-[#1e2130] rounded-2xl border border-slate-100 dark:border-white/[0.06] p-10 text-center">
        <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm text-slate-400">No ingredients found. Add your first ingredient to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e2130] rounded-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/2">
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Name</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unit</th>
            <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Stock</th>
            <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Threshold</th>
            <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
            <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) => {
            const isLow = ing.currentStock < ing.minThreshold;
            return (
              <tr key={ing._id} className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5 text-[13px] font-medium text-slate-800 dark:text-white">{ing.name}</td>
                <td className="px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400">
                  {UNIT_LABELS[ing.unit] || ing.unit}
                </td>
                <td className="px-5 py-3.5 text-right text-[13px] font-mono text-slate-800 dark:text-white">
                  {ing.currentStock}
                </td>
                <td className="px-5 py-3.5 text-right text-[13px] font-mono text-slate-500 dark:text-slate-400">
                  {ing.minThreshold}
                </td>
                <td className="px-5 py-3.5 text-center">
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
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="Log Transaction" onClick={() => onAdjustStock(ing)}>
                      <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="Edit" onClick={() => onEdit(ing)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="Delete" onClick={() => onDelete(ing._id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
