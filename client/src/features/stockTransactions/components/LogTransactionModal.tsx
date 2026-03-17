import { useState } from "react";
import {
  ArrowUpDown,
  Loader2,
  X,
  PackagePlus,
  PackageMinus,
  ArrowRightLeft,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Ingredient } from "@/features/ingredients/types/ingredient.types";
import type { ManualTransactionPayload } from "../types/stockTransaction.types";
import { shortUnit } from "../utils/stockTransaction.utils";
import {
  logTransactionSchema,
  type LogTransactionFormValues,
} from "../validations/stockTransaction.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";

const TRANSACTION_TYPES = [
  {
    value: "PURCHASE" as const,
    label: "Purchase",
    icon: <PackagePlus className="w-3.5 h-3.5" />,
  },
  {
    value: "WASTAGE" as const,
    label: "Wastage",
    icon: <PackageMinus className="w-3.5 h-3.5" />,
  },
  {
    value: "ADJUSTMENT" as const,
    label: "Adjustment",
    icon: <ArrowRightLeft className="w-3.5 h-3.5" />,
  },
];

interface LogTransactionModalProps {
  allIngredients: Ingredient[];
  onClose: () => void;
  onSubmit: (payload: ManualTransactionPayload) => Promise<void>;
}

export function LogTransactionModal({
  allIngredients,
  onClose,
  onSubmit,
}: LogTransactionModalProps) {
  const [formData, setFormData] = useState<ManualTransactionPayload>({
    ingredientId: "",
    type: "PURCHASE",
    quantity: 0,
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async () => {
    setError("");
    const result = logTransactionSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = getZodFieldErrors<LogTransactionFormValues>(
        result.error,
      );
      setError(
        fieldErrors.ingredientId ||
          fieldErrors.quantity ||
          "Validation failed.",
      );
      return;
    }

    setSaving(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      setError(
        (err as { message?: string })?.message ?? "Failed to log transaction.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#1e2130] rounded-2xl shadow-2xl shadow-black/30 border border-slate-100 dark:border-white/8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
              <ArrowUpDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Log Stock Transaction
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Create a manual purchase, wastage, or adjustment entry.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Ingredient
            </Label>
            <Select
              value={formData.ingredientId}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, ingredientId: v }))
              }
            >
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8 text-[13px]">
                <SelectValue placeholder="Select ingredient…" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
                {allIngredients.map((ing) => (
                  <SelectItem
                    key={ing._id}
                    value={ing._id}
                    className="text-[13px] rounded-lg"
                  >
                    {ing.name}
                    <span className="ml-1.5 text-slate-400 text-[11px]">
                      ({ing.currentStock} {shortUnit(ing.unit)})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Transaction Type
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {TRANSACTION_TYPES.map(({ value, label, icon }) => {
                const active = formData.type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-[11px] font-semibold transition-all ${
                      active
                        ? "border-indigo-400 dark:border-indigo-500/60 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                        : "border-slate-200 dark:border-white/8 bg-white dark:bg-white/3 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/15"
                    }`}
                  >
                    <span
                      className={active ? "text-indigo-500" : "text-slate-400"}
                    >
                      {icon}
                    </span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Quantity
              {formData.type === "ADJUSTMENT" && (
                <span className="ml-1.5 font-normal text-slate-400">
                  (negative to deduct)
                </span>
              )}
            </Label>
            <Input
              type="number"
              step="any"
              placeholder={
                formData.type === "ADJUSTMENT" ? "e.g. −5 or +10" : "e.g. 25"
              }
              value={formData.quantity || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantity: Number(e.target.value),
                }))
              }
              className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Note (optional)
            </Label>
            <Input
              placeholder="Reason for transaction…"
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !formData.ingredientId || !formData.quantity}
            className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Log Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
