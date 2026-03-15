import { ChefHat } from "lucide-react";

interface RecipeEmptyStateProps {
  hasActiveFilters: boolean;
}

export function RecipeEmptyState({ hasActiveFilters }: RecipeEmptyStateProps) {
  return (
    <div className="text-center py-20">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center mx-auto mb-3">
        <ChefHat className="w-6 h-6 text-slate-400 dark:text-slate-500" />
      </div>
      <p className="font-medium text-slate-600 dark:text-slate-300">
        {hasActiveFilters ? "No recipes match your filters" : "No recipes yet"}
      </p>
      <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
        {hasActiveFilters
          ? "Try clearing filters or a different search"
          : "Add your first recipe to link menu items to inventory"}
      </p>
    </div>
  );
}
