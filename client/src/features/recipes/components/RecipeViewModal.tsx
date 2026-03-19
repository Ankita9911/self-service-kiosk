import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Shimmer } from "@/shared/components/ui/ShimmerCell";
import type { Recipe } from "@/features/recipes/types/recipe.types";
import {
  ChefHat,
  Clock,
  Sparkles,
  Package,
  AlertTriangle,
  ClipboardList,
  Pencil,
  X,
} from "lucide-react";

interface RecipeViewModalProps {
  open: boolean;
  loading: boolean;
  recipe: Recipe | null;
  showActions?: boolean;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

export function RecipeViewModal({
  open,
  loading,
  recipe,
  showActions = true,
  onClose,
  onEdit,
}: RecipeViewModalProps) {
  const menuName =
    recipe && typeof recipe.menuItemId === "object"
      ? recipe.menuItemId.name
      : String(recipe?.menuItemId || "-");

  const menuPrice =
    recipe && typeof recipe.menuItemId === "object"
      ? recipe.menuItemId.price
      : undefined;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border border-slate-100 dark:border-white/8 bg-white dark:bg-[#1e2130] rounded-2xl shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0">
              <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                Recipe Details
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                Full ingredient breakdown and instructions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {loading || !recipe ? (
            <div className="space-y-4">
              <Shimmer w="w-1/2" h="h-5" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 dark:border-white/8 p-3 space-y-2"
                  >
                    <Shimmer w="w-16" h="h-3" />
                    <Shimmer w="w-20" h="h-4" />
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-white/8 p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Shimmer key={i} w="w-full" h="h-4" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/8 px-3 py-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">
                    {menuName}
                  </span>
                </div>
                {typeof menuPrice === "number" && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                    Rs {menuPrice}
                  </span>
                )}
                {recipe.aiGenerated && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" /> AI Generated
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-100 dark:border-white/8 p-3">
                  <p className="text-[11px] text-slate-400">Prep Time</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {recipe.prepTime} min
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-white/8 p-3">
                  <p className="text-[11px] text-slate-400">Ingredients</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                    {recipe.ingredients.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-white/8 p-3">
                  <p className="text-[11px] text-slate-400">Created</p>
                  <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(recipe.createdAt)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-white/8 p-3">
                  <p className="text-[11px] text-slate-400">Updated</p>
                  <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(recipe.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-white/8 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-white/4 border-b border-slate-100 dark:border-white/8">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ingredients
                  </h4>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/8">
                  {recipe.ingredients.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-slate-400">
                      No ingredients added.
                    </div>
                  ) : (
                    recipe.ingredients.map((row, idx) => {
                      const ingredient =
                        typeof row.ingredientId === "object"
                          ? row.ingredientId
                          : null;

                      const currentStock = ingredient?.currentStock;
                      const threshold = ingredient?.minThreshold;
                      const lowStock =
                        typeof currentStock === "number" &&
                        typeof threshold === "number" &&
                        currentStock <= threshold;

                      return (
                        <div
                          key={`${typeof row.ingredientId === "object" ? row.ingredientId._id : row.ingredientId}-${idx}`}
                          className="px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                              {ingredient
                                ? ingredient.name
                                : String(row.ingredientId)}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Required: {row.quantity} {row.unit}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 justify-end">
                              <Package className="w-3 h-3" />
                              Stock:{" "}
                              {typeof currentStock === "number"
                                ? currentStock
                                : "-"}{" "}
                              {ingredient?.unit || row.unit}
                            </p>
                            {lowStock && (
                              <p className="text-[11px] text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 mt-0.5 justify-end">
                                <AlertTriangle className="w-3 h-3" />
                                Below threshold ({threshold})
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-white/8 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Instructions
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {recipe.instructions || "No instructions added."}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={onClose}
                >
                  Close
                </Button>
                {showActions && (
                  <Button
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => onEdit(recipe)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit Recipe
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
