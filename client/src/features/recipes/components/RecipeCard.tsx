import type { Recipe } from "@/features/recipes/types/recipe.types";
import { Clock, ChefHat, Sparkles, Pencil, Trash2, Package } from "lucide-react";

interface Props {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

function getServingsInfo(recipe: Recipe) {
  const availableServings = recipe.ingredients.reduce((min, row) => {
    if (typeof row.ingredientId !== "object" || row.quantity <= 0) return min;
    return Math.min(min, Math.floor(row.ingredientId.currentStock / row.quantity));
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(availableServings)) return { label: "Recipe linked", color: "slate" };
  if (availableServings <= 0) return { label: "Out of stock", color: "red" };
  if (availableServings <= 5) return { label: `${availableServings} servings`, color: "amber" };
  return { label: `${availableServings} servings`, color: "emerald" };
}

const stockColors = {
  slate: "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400",
  red: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function RecipeCard({ recipe, onEdit, onDelete }: Props) {
  const menuItemName =
    typeof recipe.menuItemId === "object"
      ? recipe.menuItemId.name
      : recipe.menuItemId;

  const { label: stockLabel, color: stockColor } = getServingsInfo(recipe);

  return (
    <div className="group rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#1e2130] shadow-sm hover:shadow-md transition-all p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
            <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm truncate">
            {menuItemName}
          </h3>
        </div>
        {recipe.aiGenerated && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-full shrink-0">
            <Sparkles className="w-3 h-3" /> AI
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-100 dark:border-white/5">
          <Clock className="w-3 h-3" />
          {recipe.prepTime} min
        </span>
        <span className="text-[11px] text-slate-400 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-100 dark:border-white/5">
          {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? "s" : ""}
        </span>
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${stockColors[stockColor]}`}>
          <Package className="w-3 h-3" />
          {stockLabel}
        </span>
      </div>

      {/* Ingredient chips */}
      {recipe.ingredients.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recipe.ingredients.slice(0, 4).map((ri, i) => {
            const name =
              typeof ri.ingredientId === "object"
                ? ri.ingredientId.name
                : ri.ingredientId;
            return (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/[0.06]"
              >
                {name}
              </span>
            );
          })}
          {recipe.ingredients.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400">
              +{recipe.ingredients.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Instructions preview */}
      {recipe.instructions && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
          {recipe.instructions}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-slate-50 dark:border-white/5 mt-auto">
        <button
          className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
          onClick={() => onEdit(recipe)}
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
        <button
          className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          onClick={() => onDelete(recipe)}
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </div>
  );
}

