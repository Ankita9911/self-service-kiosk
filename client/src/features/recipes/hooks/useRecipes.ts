import { useEffect, useState, useCallback } from "react";
import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  aiGenerateRecipe,
} from "@/features/recipes/services/recipe.service";
import type { Recipe, RecipeFormState, AISuggestion } from "@/features/recipes/types/recipe.types";

export function useRecipes(outletId: string | undefined) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);

  const fetchRecipes = useCallback(
    async (silent = false) => {
      if (!outletId) return;
      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const result = await getRecipes(outletId, { limit: 100 });
        setRecipes(result.items);
      } catch {
        // errors handled by axiosInstance interceptor
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [outletId]
  );

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  async function handleCreate(data: RecipeFormState) {
    const cleanIngredients = data.ingredients
      .filter((i) => i.ingredientId)
      .map(({ ingredientId, quantity, unit }) => ({ ingredientId, quantity, unit }));

    const result = await createRecipe(
      { ...data, ingredients: cleanIngredients },
      outletId
    );
    await fetchRecipes(true);
    return result;
  }

  async function handleUpdate(id: string, data: Partial<RecipeFormState>) {
    if (data.ingredients) {
      data.ingredients = data.ingredients
        .filter((i) => i.ingredientId)
        .map(({ ingredientId, quantity, unit }) => ({ ingredientId, quantity, unit }));
    }
    const result = await updateRecipe(id, data, outletId);
    await fetchRecipes(true);
    return result;
  }

  async function handleDelete(id: string) {
    await deleteRecipe(id, outletId);
    await fetchRecipes(true);
  }

  async function handleAIGenerate(description: string) {
    setAiLoading(true);
    try {
      const suggestion = await aiGenerateRecipe(description, outletId);
      setAiSuggestion(suggestion);
      return suggestion;
    } catch {
      return null;
    } finally {
      setAiLoading(false);
    }
  }

  function clearAISuggestion() {
    setAiSuggestion(null);
  }

  return {
    recipes,
    loading,
    refreshing,
    aiLoading,
    aiSuggestion,
    fetchRecipes,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAIGenerate,
    clearAISuggestion,
  };
}
