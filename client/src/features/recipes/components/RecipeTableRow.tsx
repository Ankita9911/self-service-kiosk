import type { Recipe } from "@/features/recipes/types/recipe.types";
import { Clock, ChefHat, Sparkles, Package } from "lucide-react";
import { RecipeRowMenu } from "@/features/recipes/components/RecipeRowMenu";

interface Props {
  recipe: Recipe;
  index: number;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  showActions?: boolean;
}

function getServingsInfo(recipe: Recipe) {
  const available = recipe.ingredients.reduce((min, row) => {
    if (typeof row.ingredientId !== "object" || row.quantity <= 0) return min;
    return Math.min(
      min,
      Math.floor(row.ingredientId.currentStock / row.quantity),
    );
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(available))
    return {
      label: "Linked",
      className:
        "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400",
    };
  if (available <= 0)
    return {
      label: "Out of stock",
      className: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
    };
  if (available <= 5)
    return {
      label: `${available} servings`,
      className:
        "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    };
  return {
    label: `${available} servings`,
    className:
      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
}

export function RecipeTableRow({
  recipe,
  index,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}: Props) {
  const menuItemName =
    typeof recipe.menuItemId === "object"
      ? recipe.menuItemId.name
      : recipe.menuItemId;
  const { label: stockLabel, className: stockClassName } =
    getServingsInfo(recipe);

  const ingredientNames = recipe.ingredients
    .slice(0, 3)
    .map((ri) =>
      typeof ri.ingredientId === "object"
        ? ri.ingredientId.name
        : ri.ingredientId,
    );

  return (
    <tr
      onClick={() => onView(recipe)}
      className="group cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
    >
      {/* # */}
      <td className="px-5 py-3.5 text-[12px] text-slate-400 dark:text-slate-500 font-mono">
        {index + 1}
      </td>

      {/* Menu Item */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
            <ChefHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-white truncate max-w-40">
              {menuItemName}
            </p>
            {recipe.aiGenerated && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-2.5 h-2.5" /> AI Generated
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Ingredients */}
      <td className="px-5 py-3.5">
        <div className="flex flex-wrap gap-1">
          {ingredientNames.map((name, i) => (
            <span
              key={i}
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/6"
            >
              {name}
            </span>
          ))}
          {recipe.ingredients.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 text-slate-400">
              +{recipe.ingredients.length - 3}
            </span>
          )}
          {recipe.ingredients.length === 0 && (
            <span className="text-[11px] text-slate-400 italic">None</span>
          )}
        </div>
      </td>

      {/* Prep Time */}
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-400">
          <Clock className="w-3 h-3" />
          {recipe.prepTime} min
        </span>
      </td>

      {/* Availability */}
      <td className="px-5 py-3.5">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${stockClassName}`}
        >
          <Package className="w-3 h-3" />
          {stockLabel}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        {showActions && (
          <div className="flex justify-end">
            <RecipeRowMenu
              onEdit={() => onEdit(recipe)}
              onDelete={() => onDelete(recipe)}
            />
          </div>
        )}
      </td>
    </tr>
  );
}
