import { useEffect, useState } from "react";
import type { Ingredient, IngredientFormState } from "@/features/ingredients/types/ingredient.types";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Loader2, Package, Pencil, Plus, X } from "lucide-react";

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

  useEffect(() => {
    setForm({
      name: ingredient?.name ?? "",
      unit: ingredient?.unit ?? "gram",
      currentStock: ingredient?.currentStock ?? 0,
      minThreshold: ingredient?.minThreshold ?? 0,
    });
  }, [ingredient, open]);

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
      <DialogContent className="sm:max-w-md p-0 border border-slate-100 dark:border-white/8 bg-white dark:bg-[#1e2130] rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
              {isEdit ? <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">{isEdit ? "Edit Ingredient" : "Add Ingredient"}</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {isEdit ? "Update ingredient details and alert threshold." : "Create a new inventory ingredient for this outlet."}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Chicken Breast"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select
              value={form.unit}
              onValueChange={(v) => setForm((p) => ({ ...p, unit: v as IngredientFormState["unit"] }))}
            >
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8">
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
                className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8 disabled:opacity-60"
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
                className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50/80 dark:bg-white/[0.03] px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Inventory Note</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Use stock transactions for future increases or deductions after the ingredient is created.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button type="button" onClick={onClose} disabled={submitting} className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting || !form.name.trim()} className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Add Ingredient"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
