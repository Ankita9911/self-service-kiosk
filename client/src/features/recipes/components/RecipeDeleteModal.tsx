import type { Recipe } from "@/features/recipes/types/recipe.types";
import { ChefHat, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  recipe: Recipe | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting?: boolean;
}

export function RecipeDeleteModal({ open, recipe, onClose, onConfirm, deleting }: Props) {
  if (!open || !recipe) return null;

  const menuItemName =
    typeof recipe.menuItemId === "object" ? recipe.menuItemId.name : "this recipe";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/8 shadow-2xl shadow-black/30 overflow-hidden">
        {/* Red gradient header */}
        <div className="bg-gradient-to-br from-red-500 to-rose-600 px-6 pt-6 pb-8">
          <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Delete Recipe</h3>
          <p className="text-sm text-red-100 mt-1">This action cannot be undone.</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 -mt-3">
          <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/6 px-4 py-3">
            <p className="text-[13px] text-slate-500 dark:text-slate-400">Deleting recipe for</p>
            <p className="font-semibold text-slate-800 dark:text-white mt-0.5 truncate">{menuItemName}</p>
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-3">
            Stock deduction from orders placed before this deletion will not be reversed. Menu item availability will fall back to direct stock mode.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deleting ? "Deleting…" : "Delete Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
