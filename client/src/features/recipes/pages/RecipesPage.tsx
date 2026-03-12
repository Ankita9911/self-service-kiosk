import { useState, useEffect, useCallback } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { useRecipes } from "@/features/recipes/hooks/useRecipes";
import { useIngredients } from "@/features/ingredients/hooks/useIngredients";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeFormModal } from "@/features/recipes/components/RecipeFormModal";
import { AIRecipeModal } from "@/features/recipes/components/AIRecipeModal";
import type { Recipe, RecipeFormState, AISuggestion } from "@/features/recipes/types/recipe.types";
import axiosInstance from "@/shared/lib/axiosInstance";
import { Plus, Search, Sparkles, ChefHat, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface BasicMenuItem {
  _id: string;
  name: string;
}

export default function RecipesPage() {
  const { user } = useAuth();
  const outletId = user?.outletId ?? undefined;

  const {
    recipes,
    loading,
    handleCreate,
    handleUpdate,
    handleDelete,
    aiLoading,
    aiSuggestion,
    handleAIGenerate,
    clearAISuggestion,
  } = useRecipes(outletId);

  const { ingredients } = useIngredients(outletId);

  const [menuItems, setMenuItems] = useState<BasicMenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Prefill form state from AI suggestion
  const [aiPrefill, setAiPrefill] = useState<RecipeFormState | null>(null);

  // Fetch menu items for the select dropdown
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
    const loadMenuItems = async () => {
      await fetchMenuItems();
    };

    void loadMenuItems();
  }, [fetchMenuItems]);

  const filtered = search
    ? recipes.filter((r) => {
        const name =
          typeof r.menuItemId === "object" ? r.menuItemId.name : r.menuItemId;
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : recipes;

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setAiPrefill(null);
    setShowForm(true);
  };

  const confirmDelete = async (id: string) => {
    const rec = recipes.find((r) => r._id === id);
    const name =
      rec && typeof rec.menuItemId === "object"
        ? rec.menuItemId.name
        : "this recipe";
    if (!window.confirm(`Delete recipe for "${name}"?`)) return;
    await handleDelete(id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecipe(null);
    setAiPrefill(null);
  };

  const handleUseSuggestion = (suggestion: AISuggestion) => {
    // Map AI ingredient names to existing ingredient IDs where possible
    const mappedIngredients = suggestion.ingredients.map((ai) => {
      const match = ingredients.find(
        (ing) => ing.name.toLowerCase() === ai.name.toLowerCase()
      );
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            Recipes
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Link menu items to ingredients so outlet availability comes from live inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAI(true)}
            variant="outline"
            className="rounded-xl h-9 text-xs gap-2 border-slate-200 dark:border-white/8"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            AI Generate
          </Button>
          <Button
            onClick={() => {
              setEditingRecipe(null);
              setAiPrefill(null);
              setShowForm(true);
            }}
            className="rounded-xl h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Recipe
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/[0.06] shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
            <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{recipes.length}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Total Recipes</p>
          </div>
        </div>
        <div className="col-span-2 sm:col-span-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by menu item name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920]"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ChefHat className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">
            {search ? "No recipes match your search." : "No recipes yet. Create one to get started!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onEdit={handleEdit}
              onDelete={confirmDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <RecipeFormModal
          open={showForm}
          onClose={handleCloseForm}
          recipe={editingRecipe}
          initialForm={aiPrefill}
          menuItems={menuItems}
          ingredients={ingredients}
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
    </div>
  );
}
