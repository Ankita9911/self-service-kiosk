import { useEffect, useState } from "react";
import type {
  Ingredient,
  IngredientFormState,
} from "@/features/ingredients/types/ingredient.types";
import { Loader2, Package, Pencil, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ingredientFormSchema } from "@/features/ingredients/validations/ingredient.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";

export const UNITS = [
  { value: "gram", label: "Gram (g)" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "ml", label: "Milliliter (ml)" },
  { value: "liter", label: "Liter (L)" },
  { value: "piece", label: "Piece (pcs)" },
  { value: "dozen", label: "Dozen (doz)" },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  onCreate: (data: IngredientFormState) => Promise<unknown>;
  onUpdate: (
    id: string,
    data: Partial<IngredientFormState>,
  ) => Promise<unknown>;
}

export function IngredientFormModal({
  open,
  onClose,
  ingredient,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = Boolean(ingredient);

  const [form, setForm] = useState<IngredientFormState>({
    name: ingredient?.name ?? "",
    unit: ingredient?.unit ?? "gram",
    currentStock: ingredient?.currentStock ?? 0,
    minThreshold: ingredient?.minThreshold ?? 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof IngredientFormState, string>>
  >({});

  useEffect(() => {
    setForm({
      name: ingredient?.name ?? "",
      unit: ingredient?.unit ?? "gram",
      currentStock: ingredient?.currentStock ?? 0,
      minThreshold: ingredient?.minThreshold ?? 0,
    });
  }, [ingredient, open]);

  if (!open) return null;

  const handleSubmit = async () => {
    const result = ingredientFormSchema.safeParse(form);
    if (!result.success) {
      setErrors(getZodFieldErrors<IngredientFormState>(result.error));
      return;
    }

    setErrors({});
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
    <div className="fixed inset-0 z-200 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={!submitting ? onClose : undefined}
      />
      <div className="relative bg-white dark:bg-[#1e2130] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100 dark:border-white/8">
        {/* Accent bar */}
        <div className="h-0.5 bg-linear-to-r from-indigo-400 via-indigo-500 to-violet-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
              {isEdit ? (
                <Pencil className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">
                {isEdit ? "Edit Ingredient" : "Add Ingredient"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isEdit
                  ? "Update ingredient details and alert threshold."
                  : "Create a new inventory ingredient for this outlet."}
              </p>
            </div>
          </div>
          {!submitting && (
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="grid gap-4 px-5 py-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
              Ingredient Name
            </label>
            <input
              placeholder="e.g. Chicken Breast"
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-slate-50 dark:bg-white/4 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 ${
                errors.name
                  ? "border-red-400 dark:border-red-500 focus:ring-red-400/15 focus:border-red-400"
                  : "border-slate-200 dark:border-white/8 focus:ring-indigo-400/15 focus:border-indigo-300 dark:focus:border-indigo-500/40"
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-current" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Unit */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
              Measurement Unit
            </label>
            <Select
              value={form.unit}
              onValueChange={(v) =>
                setForm((p) => ({
                  ...p,
                  unit: v as IngredientFormState["unit"],
                }))
              }
            >
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-white/4 border-slate-200 dark:border-white/8 text-sm text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
                {UNITS.map((u) => (
                  <SelectItem
                    key={u.value}
                    value={u.value}
                    className="text-[13px] rounded-lg"
                  >
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                Initial Stock
              </label>
              <input
                type="number"
                min={0}
                value={form.currentStock}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    currentStock: Number(e.target.value),
                  }))
                }
                disabled={isEdit}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/4 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 focus:border-indigo-300 dark:focus:border-indigo-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                Min Threshold
              </label>
              <input
                type="number"
                min={0}
                value={form.minThreshold}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    minThreshold: Number(e.target.value),
                  }))
                }
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/4 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 focus:border-indigo-300 dark:focus:border-indigo-500/40 transition-all"
              />
            </div>
          </div>

          {/* Inventory note box */}
          <div className="rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50/80 dark:bg-white/3 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Inventory Note
                </p>
                <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isEdit
                    ? "Use stock transactions to add or deduct stock after saving."
                    : "After creating the ingredient, use stock transactions for future movements."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !form.name.trim()}
            className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Add Ingredient"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
