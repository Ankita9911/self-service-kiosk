import { useState, useEffect, useCallback } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { useRecipes } from "@/features/recipes/hooks/useRecipes";
import { useIngredients } from "@/features/ingredients/hooks/useIngredients";
import { getAllIngredients } from "@/features/ingredients/services/ingredient.service";
import { RecipeStats } from "@/features/recipes/components/RecipeStats";
import { RecipeFilters } from "@/features/recipes/components/RecipeFilters";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeTableRow } from "@/features/recipes/components/RecipeTableRow";
import { RecipeDeleteModal } from "@/features/recipes/components/RecipeDeleteModal";
import { RecipeFormModal } from "@/features/recipes/components/RecipeFormModal";
import { AIRecipeModal } from "@/features/recipes/components/AIRecipeModal";
import { findIngredientMatch } from "@/features/recipes/lib/ingredientMatching";
import { CursorPagination } from "@/shared/components/ui/CursorPagination";
import { Shimmer } from "@/features/device/components/ShimmerCell";
import type { Recipe, RecipeFormState, AISuggestion } from "@/features/recipes/types/recipe.types";
import type { Ingredient, IngredientFormState } from "@/features/ingredients/types/ingredient.types";
import axiosInstance from "@/shared/lib/axiosInstance";
import { Plus, Sparkles, ChefHat, RefreshCcw, ShieldAlert } from "lucide-react";

interface BasicMenuItem {
  _id: string;
  name: string;
}

const LAYOUT_KEY = "recipe-layout";

export default function RecipesPage() {
  const { user } = useAuth();
  const outletId = user?.outletId ?? undefined;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [aiOnly, setAiOnly] = useState(false);
  const [layout, setLayout] = useState<"grid" | "table">(() => {
    const saved = localStorage.getItem(LAYOUT_KEY);
    return saved === "table" ? "table" : "grid";
  });

  const {
    recipes,
    loading,
    refreshing,
    totalRecipes,
    aiGeneratedCount,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
    resetToFirstPage,
    fetchData,
    handleCreate,
    handleUpdate,
    handleDelete,
    aiLoading,
    aiSuggestion,
    handleAIGenerate,
    clearAISuggestion,
  } = useRecipes(outletId, { search: searchTerm, aiOnly });

  const { handleCreate: createIngredient } = useIngredients(outletId);

  const [menuItems, setMenuItems] = useState<BasicMenuItem[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<Ingredient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [aiPrefill, setAiPrefill] = useState<RecipeFormState | null>(null);

  const fetchMenuItems = useCallback(async () => {
    if (!outletId) return;
    try {
      const res = await axiosInstance.get<{ data: BasicMenuItem[] }>("/menu/items", {
        params: { outletId, limit: 500 },
      });
      setMenuItems(res.data.data);
    } catch {
      // handled by interceptor
    }
  }, [outletId]);

  useEffect(() => {
    void fetchMenuItems();
  }, [fetchMenuItems]);

  const fetchRecipeIngredients = useCallback(async () => {
    if (!outletId) return;
    try {
      const result = await getAllIngredients(outletId);
      setRecipeIngredients(result);
    } catch {
      // handled by interceptor
    }
  }, [outletId]);

  useEffect(() => {
    void fetchRecipeIngredients();
  }, [fetchRecipeIngredients]);

  const handleLayoutChange = (v: "grid" | "table") => {
    setLayout(v);
    localStorage.setItem(LAYOUT_KEY, v);
  };

  const hasActiveFilters = searchTerm !== "" || aiOnly;

  const clearFilters = () => {
    setSearchTerm("");
    setAiOnly(false);
    resetToFirstPage();
  };

  const avgPrepTime =
    recipes.length > 0
      ? Math.round(recipes.reduce((sum, r) => sum + r.prepTime, 0) / recipes.length)
      : 0;

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setAiPrefill(null);
    setShowForm(true);
  };

  const handleDeleteClick = (recipe: Recipe) => {
    setDeletingRecipe(recipe);
  };

  const confirmDelete = async () => {
    if (!deletingRecipe) return;
    setDeleteLoading(true);
    try {
      await handleDelete(deletingRecipe._id);
      setDeletingRecipe(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecipe(null);
    setAiPrefill(null);
  };

  const handleUseSuggestion = (suggestion: AISuggestion) => {
    const mappedIngredients = suggestion.ingredients.map((ai) => {
      const match = findIngredientMatch(recipeIngredients, ai.name);
      return {
        ingredientId: match?._id ?? "",
        quantity: ai.quantity,
        unit: ai.unit,
        _aiName: ai.name,
      };
    });

    setAiPrefill({
      menuItemId: "",
      ingredients: mappedIngredients,
      prepTime: suggestion.prepTime,
      instructions: suggestion.instructions,
      aiGenerated: true,
    });

    clearAISuggestion();
    setEditingRecipe(null);
    setShowForm(true);
  };

  const handleCreateRecipeIngredient = async (data: IngredientFormState) => {
    const created = await createIngredient(data);
    await fetchRecipeIngredients();
    return created;
  };

  const showShimmer = loading || refreshing;
  const TABLE_HEADERS = ["#", "Menu Item", "Ingredients", "Prep Time", "Availability", ""];

  if (!outletId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <p className="font-medium text-slate-600 dark:text-slate-300">No Outlet Assigned</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          You must be assigned to an outlet to manage recipes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
            Recipes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Link menu items to ingredients so outlet availability comes from live inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowAI(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-500/40 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Generate</span>
          </button>
          <button
            onClick={() => {
              setEditingRecipe(null);
              setAiPrefill(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Recipe</span>
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <RecipeStats
        loading={showShimmer}
        totalRecipes={totalRecipes}
        aiGeneratedCount={aiGeneratedCount}
        avgPrepTime={avgPrepTime}
      />

      {/* ── Filters ── */}
      <RecipeFilters
        searchTerm={searchTerm}
        aiOnly={aiOnly}
        layout={layout}
        onSearchChange={(v) => { setSearchTerm(v); resetToFirstPage(); }}
        onAiOnlyChange={(v) => { setAiOnly(v); resetToFirstPage(); }}
        onLayoutChange={handleLayoutChange}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {/* ── Content ── */}
      {layout === "grid" ? (
        <>
          {showShimmer ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: pageSize }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#1e2130] p-4 space-y-3">
                  <Shimmer w="w-3/4" />
                  <div className="flex gap-2">
                    <Shimmer w="w-16" h="h-5" rounded="rounded-full" />
                    <Shimmer w="w-14" h="h-5" rounded="rounded-full" />
                  </div>
                  <div className="flex gap-1">
                    <Shimmer w="w-12" h="h-5" rounded="rounded-full" />
                    <Shimmer w="w-16" h="h-5" rounded="rounded-full" />
                    <Shimmer w="w-10" h="h-5" rounded="rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : recipes.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}

          {!showShimmer && recipes.length > 0 && (
            <CursorPagination
              total={totalMatching}
              page={page}
              pageSize={pageSize}
              hasPrevPage={hasPrevPage}
              hasNextPage={hasNextPage}
              onPrevPage={goToPrevPage}
              onNextPage={goToNextPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </>
      ) : (
        /* Table layout */
        <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/4">
              {showShimmer ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4"><Shimmer w="w-6" /></td>
                    <td className="px-5 py-4"><Shimmer w="w-36" /></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <Shimmer w="w-12" h="h-5" rounded="rounded-full" />
                        <Shimmer w="w-14" h="h-5" rounded="rounded-full" />
                      </div>
                    </td>
                    <td className="px-5 py-4"><Shimmer w="w-14" /></td>
                    <td className="px-5 py-4"><Shimmer w="w-20" h="h-5" rounded="rounded-full" /></td>
                    <td className="px-5 py-4"><Shimmer w="w-14" /></td>
                  </tr>
                ))
              ) : recipes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="font-medium text-slate-600 dark:text-slate-300">
                        {hasActiveFilters ? "No recipes match your filters" : "No recipes yet"}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm">
                        {hasActiveFilters ? "Try clearing filters" : "Add your first recipe to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                recipes.map((recipe, index) => (
                  <RecipeTableRow
                    key={recipe._id}
                    recipe={recipe}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                ))
              )}
            </tbody>
          </table>

          {!showShimmer && recipes.length > 0 && (
            <CursorPagination
              total={totalMatching}
              page={page}
              pageSize={pageSize}
              hasPrevPage={hasPrevPage}
              hasNextPage={hasNextPage}
              onPrevPage={goToPrevPage}
              onNextPage={goToNextPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showForm && (
        <RecipeFormModal
          open={showForm}
          onClose={handleCloseForm}
          recipe={editingRecipe}
          initialForm={aiPrefill}
          menuItems={menuItems}
          ingredients={recipeIngredients}
          onCreateIngredient={handleCreateRecipeIngredient}
          onCreate={async (data) => {
            if (aiPrefill) data = { ...aiPrefill, ...data, menuItemId: data.menuItemId };
            return handleCreate(data);
          }}
          onUpdate={handleUpdate}
        />
      )}

      {showAI && (
        <AIRecipeModal
          open={showAI}
          onClose={() => setShowAI(false)}
          aiLoading={aiLoading}
          aiSuggestion={aiSuggestion}
          onGenerate={handleAIGenerate}
          onUseSuggestion={handleUseSuggestion}
          onClear={clearAISuggestion}
        />
      )}

      <RecipeDeleteModal
        open={Boolean(deletingRecipe)}
        recipe={deletingRecipe}
        onClose={() => setDeletingRecipe(null)}
        onConfirm={confirmDelete}
        deleting={deleteLoading}
      />
    </div>
  );
}
