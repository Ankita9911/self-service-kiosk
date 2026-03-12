import { useEffect, useState } from "react";
import type { Recipe, RecipeFormState } from "@/features/recipes/types/recipe.types";
import type { Ingredient, IngredientFormState } from "@/features/ingredients/types/ingredient.types";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Plus, Trash2, Loader2, ChefHat, Pencil, X } from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  initialForm?: RecipeFormState | null;
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  onCreateIngredient?: (data: IngredientFormState) => Promise<unknown>;
  onCreate: (data: RecipeFormState) => Promise<unknown>;
  onUpdate: (id: string, data: Partial<RecipeFormState>) => Promise<unknown>;
}

const UNITS = ["gram", "ml", "piece"] as const;

function blankRow() {
  return { ingredientId: "", quantity: 0, unit: "gram" as string };
}

function createFormSnapshot(form: RecipeFormState): RecipeFormState {
  return {
    menuItemId: form.menuItemId,
    ingredients: form.ingredients.map((row) => ({ ...row })),
    prepTime: form.prepTime,
    instructions: form.instructions,
    aiGenerated: form.aiGenerated,
  };
}

function initForm(
  recipe: Recipe | null,
  initialForm?: RecipeFormState | null
): RecipeFormState {
  if (!recipe && initialForm) {
    return createFormSnapshot(initialForm);
  }

  if (!recipe) {
    return {
      menuItemId: "",
      ingredients: [blankRow()],
      prepTime: 0,
      instructions: "",
      aiGenerated: false,
    };
  }
  return {
    menuItemId:
      typeof recipe.menuItemId === "object"
        ? recipe.menuItemId._id
        : recipe.menuItemId,
    ingredients: recipe.ingredients.map((ri) => ({
      ingredientId:
        typeof ri.ingredientId === "object"
          ? ri.ingredientId._id
          : ri.ingredientId,
      quantity: ri.quantity,
      unit: ri.unit,
    })),
    prepTime: recipe.prepTime,
    instructions: recipe.instructions,
    aiGenerated: recipe.aiGenerated,
  };
}

export function RecipeFormModal({
  open,
  onClose,
  recipe,
  initialForm,
  menuItems,
  ingredients,
  onCreateIngredient,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = Boolean(recipe);
  const [form, setForm] = useState<RecipeFormState>(() =>
    initForm(recipe, initialForm)
  );
  const [saving, setSaving] = useState(false);
  const [creatingIngredientNames, setCreatingIngredientNames] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setForm(initForm(recipe, initialForm));
  }, [initialForm, open, recipe]);

  useEffect(() => {
    if (!open || ingredients.length === 0) return;

    setForm((prev) => {
      let changed = false;
      const nextIngredients = prev.ingredients.map((row) => {
        if (row.ingredientId || !row._aiName) return row;

        const match = ingredients.find(
          (ingredient) => ingredient.name.toLowerCase() === row._aiName?.toLowerCase()
        );

        if (!match) return row;

        changed = true;
        return {
          ...row,
          ingredientId: match._id,
          unit: match.unit,
        };
      });

      return changed ? { ...prev, ingredients: nextIngredients } : prev;
    });
  }, [ingredients, open]);

  const unresolvedAiIngredients = form.ingredients.filter(
    (row) => !row.ingredientId && row._aiName
  );
  const hasUnresolvedAiIngredients = unresolvedAiIngredients.length > 0;

  const updateRow = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setForm((prev) => {
      const rows = [...prev.ingredients];
      rows[index] = { ...rows[index], [field]: value };
      // auto-set unit from selected ingredient
      if (field === "ingredientId") {
        const ing = ingredients.find((i) => i._id === value);
        if (ing) {
          rows[index].unit = ing.unit;
          rows[index]._aiName = undefined;
        }
      }
      return { ...prev, ingredients: rows };
    });
  };

  const addRow = () =>
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, blankRow()],
    }));

  const removeRow = (index: number) =>
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));

  const handleCreateMissingIngredient = async (ingredientName: string) => {
    if (!onCreateIngredient) return;

    const missingRow = form.ingredients.find(
      (row) => !row.ingredientId && row._aiName === ingredientName
    );
    if (!missingRow) return;

    const defaultStock = Math.max(1, Number(missingRow.quantity) || 0);

    setCreatingIngredientNames((prev) => [...prev, ingredientName]);
    try {
      const created = await onCreateIngredient({
        name: ingredientName,
        unit: (missingRow.unit || "gram") as IngredientFormState["unit"],
        currentStock: defaultStock,
        minThreshold: defaultStock,
      });

      const createdIngredient = created as Ingredient;
      setForm((prev) => ({
        ...prev,
        ingredients: prev.ingredients.map((row) =>
          !row.ingredientId && row._aiName === ingredientName
            ? {
                ...row,
                ingredientId: createdIngredient._id,
                unit: createdIngredient.unit,
                _aiName: undefined,
              }
            : row
        ),
      }));
    } catch {
      // handled by interceptor
    } finally {
      setCreatingIngredientNames((prev) =>
        prev.filter((name) => name !== ingredientName)
      );
    }
  };

  const handleSubmit = async () => {
    if (!form.menuItemId) return;
    setSaving(true);
    try {
      if (isEdit && recipe) {
        await onUpdate(recipe._id, form);
      } else {
        await onCreate(form);
      }
      onClose();
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border border-slate-100 dark:border-white/8 bg-white dark:bg-[#1e2130] rounded-2xl shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center">
              {isEdit ? (
                <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ) : (
                <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isEdit ? "Edit Recipe" : "Add Recipe"}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Link menu items with ingredient quantities for live outlet availability.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Menu Item */}
          <div className="space-y-1.5">
            <Label>Menu Item</Label>
            <Select
              value={form.menuItemId}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, menuItemId: v }))
              }
              disabled={isEdit}
            >
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8">
                <SelectValue placeholder="Select menu item…" />
              </SelectTrigger>
              <SelectContent>
                {menuItems.map((mi) => (
                  <SelectItem key={mi._id} value={mi._id}>
                    {mi.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                className="gap-1 text-xs rounded-xl border-slate-200 dark:border-white/8"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </Button>
            </div>

            {hasUnresolvedAiIngredients && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                <p className="font-semibold">
                  Create these ingredients before saving this recipe.
                </p>
                <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-100/80">
                  AI suggested ingredients below are not in inventory yet. You
                  can add them here with stock for one dish, then adjust them
                  later from Ingredients.
                </p>
                <div className="mt-3 space-y-2">
                  {unresolvedAiIngredients.map((row) => {
                    const ingredientName = row._aiName ?? "";
                    const isCreating = creatingIngredientNames.includes(ingredientName);

                    return (
                      <div
                        key={`${ingredientName}-${row.unit}-${row.quantity}`}
                        className="flex items-center gap-3 rounded-xl border border-amber-200/80 bg-white/80 px-3 py-2.5 dark:border-amber-500/10 dark:bg-black/10"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-amber-950 dark:text-amber-50">
                              {ingredientName}
                            </p>
                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                              Missing
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-amber-800/90 dark:text-amber-100/75">
                            Add with default stock for one dish: {Math.max(1, Number(row.quantity) || 0)} {row.unit}
                          </p>
                        </div>
                        {onCreateIngredient && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleCreateMissingIngredient(ingredientName)}
                            disabled={isCreating}
                            className="h-9 shrink-0 rounded-xl bg-amber-600 px-3.5 text-xs font-semibold text-white hover:bg-amber-700"
                          >
                            {isCreating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "Add Ingredient"
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {form.ingredients.map((row, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="grid grid-cols-[1fr_100px_90px_36px] gap-2 items-end">
                    <div className="space-y-1">
                      {idx === 0 && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Ingredient
                        </span>
                      )}
                      <Select
                        value={row.ingredientId}
                        onValueChange={(v) =>
                          updateRow(idx, "ingredientId", v)
                        }
                      >
                        <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8">
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ing) => (
                            <SelectItem key={ing._id} value={ing._id}>
                              {ing.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      {idx === 0 && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Qty
                        </span>
                      )}
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={row.quantity || ""}
                        onChange={(e) =>
                          updateRow(idx, "quantity", Number(e.target.value))
                        }
                        className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8"
                      />
                    </div>

                    <div className="space-y-1">
                      {idx === 0 && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Unit
                        </span>
                      )}
                      <Select
                        value={row.unit}
                        onValueChange={(v) => updateRow(idx, "unit", v)}
                      >
                        <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeRow(idx)}
                      disabled={form.ingredients.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {!row.ingredientId && row._aiName && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/70 bg-amber-50/70 px-3 py-2 dark:border-amber-500/10 dark:bg-amber-500/5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-amber-700 dark:text-amber-300">
                          AI suggested ingredient: {row._aiName}
                        </p>
                        <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                          Add it now with {Math.max(1, Number(row.quantity) || 0)} {row.unit} default stock.
                        </p>
                      </div>
                      {onCreateIngredient && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleCreateMissingIngredient(row._aiName ?? "")}
                          disabled={creatingIngredientNames.includes(row._aiName ?? "")}
                          className="h-8 shrink-0 rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white hover:bg-amber-700"
                        >
                          {creatingIngredientNames.includes(row._aiName ?? "") ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            "Add"
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prep Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Prep Time (minutes)</Label>
              <Input
                type="number"
                min={0}
                value={form.prepTime || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    prepTime: Number(e.target.value),
                  }))
                }
                className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <Label>Instructions</Label>
            <textarea
              className="flex min-h-[120px] w-full rounded-2xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              placeholder="Step-by-step preparation instructions…"
              value={form.instructions}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  instructions: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button type="button" onClick={onClose} disabled={saving} className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving || !form.menuItemId || hasUnresolvedAiIngredients} className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Recipe"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
