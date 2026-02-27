import { useState } from "react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { RefreshCcw, Plus, ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { menuItemSchema, type MenuItemFormValues } from "../validations/menu.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";

interface Props {
  open: boolean;
  onClose: () => void;
  categories: { _id: string; name: string }[];
  form: { categoryId: string; name: string; description: string; imageFile: File | null; price: string; stockQuantity: string };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: () => Promise<void>;
}

type FieldErrors = Partial<Record<keyof MenuItemFormValues, string>>;

export function AddItemModal({ open, onClose, categories, form, setForm, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const payload = { categoryId: form.categoryId, name: form.name, description: form.description, price: form.price, stockQuantity: form.stockQuantity, imageFile: form.imageFile ?? undefined };
    const result = menuItemSchema.safeParse(payload);
    if (result.success) { setErrors({}); return true; }
    setErrors(getZodFieldErrors<MenuItemFormValues>(result.error));
    return false;
  }

  function clearError(key: keyof MenuItemFormValues) {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit();
      setErrors({});
      toast.success("Item added successfully!");
      onClose();
    } catch {
      toast.error("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputCls = (field: keyof MenuItemFormValues) =>
    `h-10 rounded-xl bg-slate-50 font-satoshi text-sm border transition-all focus-visible:outline-none focus-visible:ring-2 ${errors[field] ? "border-red-400 focus-visible:ring-red-400/40 focus-visible:border-red-400" : "border-slate-200 focus-visible:ring-orange-400/40"}`;

  const ErrMsg = ({ field }: { field: keyof MenuItemFormValues }) =>
    errors[field] ? (
      <p className="text-[11px] text-red-500 flex items-center gap-1">
        <span className="inline-block h-1 w-1 rounded-full bg-red-500" />{errors[field]}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-clash-bold text-slate-900 text-base">Add Menu Item</h3>
          <p className="text-xs font-satoshi text-slate-500 mt-0.5">Fill in the details for the new product</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4" noValidate>
          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Category <span className="text-red-400">*</span></Label>
            <Select value={form.categoryId} onValueChange={(val) => { setForm((prev: any) => ({ ...prev, categoryId: val })); clearError("categoryId"); }}>
              <SelectTrigger className={`h-10 rounded-xl bg-white font-satoshi text-sm border transition-all ${errors.categoryId ? "border-red-400" : "border-slate-200 focus:ring-orange-400/40"}`}>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                {categories.map((c) => <SelectItem key={c._id} value={c._id} className="font-satoshi text-sm">{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <ErrMsg field="categoryId" />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Name <span className="text-red-400">*</span></Label>
            <Input value={form.name} onChange={(e) => { setForm((prev: any) => ({ ...prev, name: e.target.value })); clearError("name"); }} placeholder="e.g. Masala Chai" className={inputCls("name")} />
            <ErrMsg field="name" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Description <span className="text-slate-400 font-satoshi normal-case">(optional)</span></Label>
            <Input value={form.description} onChange={(e) => { setForm((prev: any) => ({ ...prev, description: e.target.value })); clearError("description"); }} placeholder="Short description" className={inputCls("description")} />
            <ErrMsg field="description" />
          </div>

          {/* Image */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-clash-semibold text-slate-500 uppercase tracking-wider">Image <span className="text-slate-400 font-satoshi normal-case">(optional)</span></Label>
            <div className="flex gap-2 items-center">
              <Input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => { setForm((prev: any) => ({ ...prev, imageFile: e.target.files?.[0] || null })); clearError("imageFile"); }}
                className={`h-10 rounded-xl bg-slate-50 font-satoshi text-sm border ${errors.imageFile ? "border-red-400" : "border-slate-200"}`} />
              {form.imageFile
                ? <div className="h-10 w-10 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0"><img src={URL.createObjectURL(form.imageFile)} alt="Preview" className="h-full w-full object-cover" /></div>
                : <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0"><ImageIcon className="w-4 h-4 text-slate-400" /></div>
              }
            </div>
            <ErrMsg field="imageFile" />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Price (₹) <span className="text-red-400">*</span></Label>
              <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => { setForm((prev: any) => ({ ...prev, price: e.target.value })); clearError("price"); }} placeholder="0" className={inputCls("price")} />
              <ErrMsg field="price" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Stock Qty <span className="text-red-400">*</span></Label>
              <Input type="number" min="0" step="1" value={form.stockQuantity} onChange={(e) => { setForm((prev: any) => ({ ...prev, stockQuantity: e.target.value })); clearError("stockQuantity"); }} placeholder="0" className={inputCls("stockQuantity")} />
              <ErrMsg field="stockQuantity" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Item</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
