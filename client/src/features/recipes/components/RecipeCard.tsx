import type { Recipe } from "@/features/recipes/types/recipe.types";
import { Clock, ChefHat, Sparkles, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface Props {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, onEdit, onDelete }: Props) {
  const menuItemName =
    typeof recipe.menuItemId === "object"
      ? recipe.menuItemId.name
      : recipe.menuItemId;
  const availableServings = recipe.ingredients.reduce((min, row) => {
    if (typeof row.ingredientId !== "object" || row.quantity <= 0) return min;
    return Math.min(min, Math.floor(row.ingredientId.currentStock / row.quantity));
  }, Number.POSITIVE_INFINITY);
  const stockLabel = Number.isFinite(availableServings)
    ? availableServings <= 0
      ? "Out of stock"
      : `${availableServings} servings`
    : "Recipe linked";

  return (
    <div className="group rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#1e2130] shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
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

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {recipe.prepTime} min
        </span>
        <span>{recipe.ingredients.length} ingredients</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          <Package className="w-3 h-3" />
          {stockLabel}
        </span>
      </div>

      {/* Ingredient chips */}
      <div className="flex flex-wrap gap-1">
        {recipe.ingredients.slice(0, 5).map((ri, i) => {
          const name =
            typeof ri.ingredientId === "object"
              ? ri.ingredientId.name
              : ri.ingredientId;
          return (
            <span
              key={i}
              className="text-[11px] px-2 py-0.5 rounded-full bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/[0.06]"
            >
              {name}
            </span>
          );
        })}
        {recipe.ingredients.length > 5 && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400">
            +{recipe.ingredients.length - 5} more
          </span>
        )}
      </div>

      {/* Instructions preview */}
      {recipe.instructions && (
        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
          {recipe.instructions}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-slate-50 dark:border-white/5 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs h-7"
          onClick={() => onEdit(recipe)}
        >
          <Pencil className="w-3 h-3" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs h-7 text-red-500 hover:text-red-600"
          onClick={() => onDelete(recipe._id)}
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </Button>
      </div>
    </div>
  );
}
