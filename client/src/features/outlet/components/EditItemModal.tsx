import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { editMenuItemSchema, type EditMenuItemFormValues } from "../validations/menu.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  form: { name: string; description: string; imageUrl?: string; imageFile: File | null; price: string; stockQuantity: string };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: () => Promise<void>;
}

type FieldErrors = Partial<Record<keyof EditMenuItemFormValues, string>>;

export function EditItemModal({ open, onClose, form, setForm, onSubmit }: Props) {
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const payload = { name: form.name, description: form.description, price: form.price, stockQuantity: form.stockQuantity, imageFile: form.imageFile ?? undefined };
    const result = editMenuItemSchema.safeParse(payload);
    if (result.success) { setErrors({}); return true; }
    setErrors(getZodFieldErrors<EditMenuItemFormValues>(result.error));
    return false;
  }

  function clearError(key: keyof EditMenuItemFormValues) {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit();
  }

  const inputCls = (field: keyof EditMenuItemFormValues) =>
    `border transition-all focus-visible:outline-none focus-visible:ring-2 ${errors[field] ? "border-red-400 focus-visible:ring-red-400/40 focus-visible:border-red-400" : "border-slate-200 focus-visible:ring-orange-400/40"}`;

  const ErrMsg = ({ field }: { field: keyof EditMenuItemFormValues }) =>
    errors[field] ? (
      <p className="text-[11px] text-red-500 flex items-center gap-1">
        <span className="inline-block h-1 w-1 rounded-full bg-red-500" />{errors[field]}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit Menu Item</DialogTitle></DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => { setForm((prev: any) => ({ ...prev, name: e.target.value })); clearError("name"); }} className={inputCls("name")} />
            <ErrMsg field="name" />
          </div>

          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Input value={form.description} onChange={(e) => { setForm((prev: any) => ({ ...prev, description: e.target.value })); clearError("description"); }} className={inputCls("description")} />
            <ErrMsg field="description" />
          </div>

          <div className="space-y-2">
            <Label>Image (optional)</Label>
            <Input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => { setForm((prev: any) => ({ ...prev, imageFile: e.target.files?.[0] || null })); clearError("imageFile"); }}
              className={`border ${errors.imageFile ? "border-red-400" : "border-slate-200"}`} />
            <ErrMsg field="imageFile" />
            {form.imageFile && <div className="h-24 w-24 rounded-md overflow-hidden border"><img src={URL.createObjectURL(form.imageFile)} alt="New Preview" className="h-full w-full object-cover" /></div>}
            {!form.imageFile && form.imageUrl && <div className="h-24 w-24 rounded-md overflow-hidden border"><img src={form.imageUrl} alt="Current" className="h-full w-full object-cover" /></div>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Price (₹) *</Label>
              <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => { setForm((prev: any) => ({ ...prev, price: e.target.value })); clearError("price"); }} className={inputCls("price")} />
              <ErrMsg field="price" />
            </div>
            <div className="space-y-1.5">
              <Label>Stock Qty *</Label>
              <Input type="number" min="0" step="1" value={form.stockQuantity} onChange={(e) => { setForm((prev: any) => ({ ...prev, stockQuantity: e.target.value })); clearError("stockQuantity"); }} className={inputCls("stockQuantity")} />
              <ErrMsg field="stockQuantity" />
            </div>
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
