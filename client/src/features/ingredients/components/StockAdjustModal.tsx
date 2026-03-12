import { useEffect, useState } from "react";
import type { Ingredient, StockAdjustPayload } from "@/features/ingredients/types/ingredient.types";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ArrowUpDown, Loader2, X } from "lucide-react";

const ADJUST_TYPES = [
  { value: "PURCHASE", label: "Purchase (add stock)" },
  { value: "WASTAGE", label: "Wastage (remove stock)" },
  { value: "ADJUSTMENT", label: "Adjustment" },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  ingredient: Ingredient;
  onAdjust: (id: string, data: StockAdjustPayload) => Promise<unknown>;
}

export function StockAdjustModal({ open, onClose, ingredient, onAdjust }: Props) {
  const [quantity, setQuantity] = useState(0);
  const [type, setType] = useState<StockAdjustPayload["type"]>("PURCHASE");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuantity(0);
    setType("PURCHASE");
    setNote("");
  }, [ingredient._id, open]);

  const handleSubmit = async () => {
    if (quantity <= 0) return;
    setSubmitting(true);
    try {
      await onAdjust(ingredient._id, {
        type,
        quantity: type === "ADJUSTMENT" ? quantity : Math.abs(quantity),
        note: note || undefined,
      });
      setQuantity(0);
      setType("PURCHASE");
      setNote("");
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
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
              <ArrowUpDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Log Stock Transaction</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {ingredient.name} • Current stock {ingredient.currentStock} {ingredient.unit}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as StockAdjustPayload["type"])}>
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADJUST_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qty">Quantity ({ingredient.unit})</Label>
            <Input
              id="qty"
              type="number"
              min={type === "ADJUSTMENT" ? undefined : 1}
              value={quantity || ""}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8"
              placeholder={type === "ADJUSTMENT" ? "Use negative value to deduct" : "Enter quantity"}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              placeholder="e.g. Weekly restock"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50/80 dark:bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Module Source</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              This action records a manual stock transaction and updates ingredient inventory together.
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button type="button" onClick={onClose} disabled={submitting} className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting || quantity === 0} className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Log Transaction
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
