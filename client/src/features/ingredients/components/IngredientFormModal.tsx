import { useState } from "react";
import type { Ingredient, IngredientFormState } from "@/features/ingredients/types/ingredient.types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";

const UNITS = [
  { value: "gram", label: "Gram (g)" },
  { value: "ml", label: "Milliliter (ml)" },
  { value: "piece", label: "Piece (pcs)" },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  onCreate: (data: IngredientFormState) => Promise<unknown>;
  onUpdate: (id: string, data: Partial<IngredientFormState>) => Promise<unknown>;
}

export function IngredientFormModal({ open, onClose, ingredient, onCreate, onUpdate }: Props) {
  const isEdit = Boolean(ingredient);

  const [form, setForm] = useState<IngredientFormState>({
    name: ingredient?.name ?? "",
    unit: ingredient?.unit ?? "gram",
    currentStock: ingredient?.currentStock ?? 0,
    minThreshold: ingredient?.minThreshold ?? 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (isEdit && ingredient) {
        await onUpdate(ingredient._id, {
          name: form.name,
          unit: form.unit,
          minThreshold: form.minThreshold,
        });
      } else {
        await onCreate(form);
      }
      onClose();
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Ingredient" : "Add Ingredient"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the ingredient details."
              : "Create a new ingredient for this outlet."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Chicken Breast"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select
              value={form.unit}
              onValueChange={(v) => setForm((p) => ({ ...p, unit: v as IngredientFormState["unit"] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                min={0}
                value={form.currentStock}
                onChange={(e) =>
                  setForm((p) => ({ ...p, currentStock: Number(e.target.value) }))
                }
                disabled={isEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minThreshold">Min Threshold</Label>
              <Input
                id="minThreshold"
                type="number"
                min={0}
                value={form.minThreshold}
                onChange={(e) =>
                  setForm((p) => ({ ...p, minThreshold: Number(e.target.value) }))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !form.name.trim()}>
            {submitting ? "Saving…" : isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
