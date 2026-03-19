import { useState, useEffect, useCallback } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { useRecipes } from "@/features/recipes/hooks/useRecipes";
import { useIngredients } from "@/features/ingredients/hooks/useIngredients";
import { getAllIngredients } from "@/features/ingredients/services/ingredient.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import { RecipeStats } from "@/features/recipes/components/RecipeStats";
import { RecipeFilters } from "@/features/recipes/components/RecipeFilters";
import { RecipePageHeader } from "@/features/recipes/components/RecipePageHeader";
import { RecipeEmptyState } from "@/features/recipes/components/RecipeEmptyState";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeTableRow } from "@/features/recipes/components/RecipeTableRow";
import { RecipeDeleteModal } from "@/features/recipes/components/RecipeDeleteModal";
import { RecipeFormModal } from "@/features/recipes/components/RecipeFormModal";
import { RecipeViewModal } from "@/features/recipes/components/RecipeViewModal";
import { AIRecipeModal } from "@/features/recipes/components/AIRecipeModal";
import { findIngredientMatch } from "@/features/recipes/lib/ingredientMatching";
import { getRecipeById } from "@/features/recipes/services/recipe.service";
import { CursorPagination } from "@/shared/components/ui/CursorPagination";
import { Shimmer } from "@/shared/components/ui/ShimmerCell";
import type {
  Recipe,
  RecipeFormState,
  AISuggestion,
} from "@/features/recipes/types/recipe.types";
import type {
  Ingredient,
  IngredientFormState,
} from "@/features/ingredients/types/ingredient.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import axiosInstance from "@/shared/lib/axiosInstance";
import { ShieldAlert } from "lucide-react";

interface BasicMenuItem {
  _id: string;
  name: string;
}

const LAYOUT_KEY = "recipe-layout";
const TABLE_HEADERS = [
  "#",
  "Menu Item",
  "Ingredients",
  "Prep Time",
  "Availability",
  "",
];

export default function RecipesPage() {
  const { user } = useAuth();
  const isFranchiseAdmin = user?.role === "FRANCHISE_ADMIN";
  const [outletFilter, setOutletFilter] = useState(user?.outletId ?? "ALL");
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const listOutletId =
    user?.outletId ?? (outletFilter !== "ALL" ? outletFilter : undefined);
  const actionOutletId =
    user?.outletId ?? (outletFilter !== "ALL" ? outletFilter : undefined);

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
  } = useRecipes(
    listOutletId,
    { search: searchTerm, aiOnly },
    actionOutletId,
    isFranchiseAdmin && !user?.outletId,
  );

  const { handleCreate: createIngredient } = useIngredients(
    listOutletId,
    undefined,
    actionOutletId,
    isFranchiseAdmin && !user?.outletId,
  );

  const [menuItems, setMenuItems] = useState<BasicMenuItem[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<Ingredient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [aiPrefill, setAiPrefill] = useState<RecipeFormState | null>(null);

  useEffect(() => {
    if (!isFranchiseAdmin || user?.outletId) return;
    void getOutlets()
      .then(setOutlets)
      .catch(() => setOutlets([]));
  }, [isFranchiseAdmin, user?.outletId]);

  const fetchMenuItems = useCallback(async () => {
    if (!listOutletId) return;
    try {
      const res = await axiosInstance.get<{ data: BasicMenuItem[] }>(
        "/menu/items",
        {
          params: { outletId: listOutletId, limit: 500 },
        },
      );
      setMenuItems(res.data.data);
    } catch {
      // handled by interceptor
    }
  }, [listOutletId]);

  useEffect(() => {
    void fetchMenuItems();
  }, [fetchMenuItems]);

  const fetchRecipeIngredients = useCallback(async () => {
    if (!listOutletId) return;
    try {
      const result = await getAllIngredients(listOutletId);
      setRecipeIngredients(result);
    } catch {
      // handled by interceptor
    }
  }, [listOutletId]);

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
    if (isFranchiseAdmin && !user?.outletId) setOutletFilter("ALL");
    resetToFirstPage();
  };

  const avgPrepTime =
    recipes.length > 0
      ? Math.round(
          recipes.reduce((sum, r) => sum + r.prepTime, 0) / recipes.length,
        )
      : 0;

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setAiPrefill(null);
    setShowForm(true);
  };

  const handleView = async (recipe: Recipe) => {
    setViewingRecipe(recipe);
    setViewModalOpen(true);
    setViewLoading(true);
    try {
      const fullRecipe = await getRecipeById(recipe._id, listOutletId);
      setViewingRecipe(fullRecipe);
    } catch {
      // handled by interceptor; fallback to already loaded row data
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditFromView = (recipe: Recipe) => {
    setViewModalOpen(false);
    handleEdit(recipe);
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

  if (!listOutletId && !isFranchiseAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <p className="font-medium text-slate-600 dark:text-slate-300">
          No Outlet Assigned
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          You must be assigned to an outlet to manage recipes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RecipePageHeader
        refreshing={refreshing}
        canAdd={Boolean(actionOutletId)}
        onRefresh={() => fetchData(true)}
        onAIGenerate={() => setShowAI(true)}
        onAdd={() => {
          setEditingRecipe(null);
          setAiPrefill(null);
          setShowForm(true);
        }}
      />

      <RecipeStats
        loading={showShimmer}
        totalRecipes={totalRecipes}
        aiGeneratedCount={aiGeneratedCount}
        avgPrepTime={avgPrepTime}
      />

      <RecipeFilters
        searchTerm={searchTerm}
        aiOnly={aiOnly}
        layout={layout}
        onSearchChange={(v) => {
          setSearchTerm(v);
          resetToFirstPage();
        }}
        onAiOnlyChange={(v) => {
          setAiOnly(v);
          resetToFirstPage();
        }}
        onLayoutChange={handleLayoutChange}
        filterableOutlets={
          isFranchiseAdmin && !user?.outletId ? outlets : undefined
        }
        outletFilter={outletFilter}
        onOutletChange={(v) => {
          setOutletFilter(v);
          resetToFirstPage();
        }}
        hasActiveFilters={
          hasActiveFilters ||
          (isFranchiseAdmin && !user?.outletId && outletFilter !== "ALL")
        }
        onClearFilters={clearFilters}
      />

      {layout === "grid" ? (
        <>
          {showShimmer ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: pageSize }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-100 dark:border-white/6 bg-white dark:bg-[#1e2130] p-4 space-y-3"
                >
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
            <RecipeEmptyState hasActiveFilters={hasActiveFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={setDeletingRecipe}
                  showActions={Boolean(actionOutletId)}
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
                    <td className="px-5 py-4">
                      <Shimmer w="w-6" />
                    </td>
                    <td className="px-5 py-4">
                      <Shimmer w="w-36" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <Shimmer w="w-12" h="h-5" rounded="rounded-full" />
                        <Shimmer w="w-14" h="h-5" rounded="rounded-full" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Shimmer w="w-14" />
                    </td>
                    <td className="px-5 py-4">
                      <Shimmer w="w-20" h="h-5" rounded="rounded-full" />
                    </td>
                    <td className="px-5 py-4">
                      <Shimmer w="w-14" />
                    </td>
                  </tr>
                ))
              ) : recipes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4">
                    <RecipeEmptyState hasActiveFilters={hasActiveFilters} />
                  </td>
                </tr>
              ) : (
                recipes.map((recipe, index) => (
                  <RecipeTableRow
                    key={recipe._id}
                    recipe={recipe}
                    index={index}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={setDeletingRecipe}
                    showActions={Boolean(actionOutletId)}
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

      {showForm && (
        <RecipeFormModal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingRecipe(null);
            setAiPrefill(null);
          }}
          recipe={editingRecipe}
          initialForm={aiPrefill}
          menuItems={menuItems}
          ingredients={recipeIngredients}
          onCreateIngredient={handleCreateRecipeIngredient}
          onCreate={async (data) => {
            if (aiPrefill)
              data = { ...aiPrefill, ...data, menuItemId: data.menuItemId };
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

      <RecipeViewModal
        open={viewModalOpen}
        loading={viewLoading}
        recipe={viewingRecipe}
        showActions={Boolean(actionOutletId)}
        onClose={() => setViewModalOpen(false)}
        onEdit={handleEditFromView}
      />

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
