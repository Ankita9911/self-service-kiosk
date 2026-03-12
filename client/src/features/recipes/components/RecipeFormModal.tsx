import { useEffect, useState } from "react";
import type { Recipe, RecipeFormState } from "@/features/recipes/types/recipe.types";
import type { Ingredient } from "@/features/ingredients/types/ingredient.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  onCreate: (data: RecipeFormState) => Promise<unknown>;
  onUpdate: (id: string, data: Partial<RecipeFormState>) => Promise<unknown>;
}

const UNITS = ["gram", "ml", "piece"] as const;

function blankRow() {
  return { ingredientId: "", quantity: 0, unit: "gram" as string };
}

function initForm(recipe: Recipe | null): RecipeFormState {
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
  menuItems,
  ingredients,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = Boolean(recipe);
  const [form, setForm] = useState<RecipeFormState>(() => initForm(recipe));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initForm(recipe));
  }, [recipe]);

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
        if (ing) rows[index].unit = ing.unit;
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Recipe" : "New Recipe"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
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
              <SelectTrigger>
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
                className="gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </Button>
            </div>

            <div className="space-y-2.5">
              {form.ingredients.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_100px_90px_36px] gap-2 items-end"
                >
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
                      <SelectTrigger>
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
                      <SelectTrigger>
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
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <Label>Instructions</Label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !form.menuItemId}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Recipe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
