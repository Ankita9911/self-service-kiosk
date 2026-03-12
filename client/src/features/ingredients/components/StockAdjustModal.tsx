import { useState } from "react";
import type { Ingredient, StockAdjustPayload } from "@/features/ingredients/types/ingredient.types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";

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
  const [_type, setType] = useState<string>("PURCHASE");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (quantity <= 0) return;
    setSubmitting(true);
    try {
      await onAdjust(ingredient._id, { quantity, note: note || undefined });
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
          <DialogTitle>Adjust Stock — {ingredient.name}</DialogTitle>
          <DialogDescription>
            Current stock: <strong>{ingredient.currentStock} {ingredient.unit}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={_type} onValueChange={setType}>
              <SelectTrigger>
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
              min={1}
              value={quantity || ""}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              placeholder="e.g. Weekly restock"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || quantity <= 0}>
            {submitting ? "Saving…" : "Adjust Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
