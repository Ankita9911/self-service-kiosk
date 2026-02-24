import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
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
import { RefreshCcw, Plus } from "lucide-react";
import { toast } from "react-hot-toast"; // Using sonner for success toast

interface Props {
  open: boolean;
  onClose: () => void;
  categories: { _id: string; name: string }[];
  form: {
    categoryId: string;
    name: string;
    description: string;
    imageUrl: string;
    price: string;
    stockQuantity: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: () => Promise<void>;
}

export function AddItemModal({
  open,
  onClose,
  categories,
  form,
  setForm,
  onSubmit,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit();
      toast.success("Item added successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        {/* Styled Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-clash-bold text-slate-900 text-base">Add Menu Item</h3>
            <p className="text-xs font-satoshi text-slate-500 mt-0.5">Fill in the details for the new product</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
          {/* CATEGORY SELECT - SHADCN UI */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
              Category <span className="text-red-400">*</span>
            </Label>
            <Select
              value={form.categoryId}
              onValueChange={(val) => setForm((prev: any) => ({ ...prev, categoryId: val }))}
              required
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white font-satoshi text-sm focus:ring-orange-400/40">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id} className="font-satoshi text-sm">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
              Name <span className="text-red-400">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev: any) => ({ ...prev, name: e.target.value }))}
              required
              placeholder="e.g. Masala Chai"
              className="h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
              Description <span className="text-slate-400 font-satoshi normal-case">(optional)</span>
            </Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((prev: any) => ({ ...prev, description: e.target.value }))}
              placeholder="Short description"
              className="h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
                Price (₹) <span className="text-red-400">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((prev: any) => ({ ...prev, price: e.target.value }))}
                required
                placeholder="0"
                className="h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
                Stock Qty <span className="text-red-400">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={(e) => setForm((prev: any) => ({ ...prev, stockQuantity: e.target.value }))}
                required
                placeholder="0"
                className="h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add Item
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}