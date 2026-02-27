import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { editMenuItemSchema, type EditMenuItemFormValues } from "../validations/menu.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";
import { useState } from "react";
import { Pencil, X, ImageIcon, RefreshCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
  form: { name: string; description: string; imageUrl?: string; imageFile: File | null; price: string; stockQuantity: string; categoryId?: string };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: () => Promise<void>;
  categories?: { _id: string; name: string }[];
}

type FieldErrors = Partial<Record<keyof EditMenuItemFormValues, string>>;

const inputBase = "w-full px-3 h-10 rounded-xl border bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all";
const inputOk  = "border-slate-200 dark:border-white/8 focus:ring-indigo-500/30 focus:border-indigo-400";
const inputErr  = "border-red-400 focus:ring-red-400/30 focus:border-red-400";

const LabelEl = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{children}</label>
);

const ErrTxt = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-400" />{msg}</p> : null;

export function EditItemModal({ open, onClose, form, setForm, onSubmit, categories }: Props) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try { await onSubmit(); setErrors({}); }
    finally { setIsSubmitting(false); }
  }

  const previewSrc = form.imageFile ? URL.createObjectURL(form.imageFile) : form.imageUrl;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border border-slate-100 dark:border-white/8 bg-white dark:bg-[#1e2130] rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Edit Menu Item</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Update the item details below</p>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4" noValidate>
          {/* Category (optional) */}
          {categories && categories.length > 0 && (
            <div>
              <LabelEl>Category</LabelEl>
              <Select value={form.categoryId ?? ""} onValueChange={(val) => setForm((prev: any) => ({ ...prev, categoryId: val }))}>
                <SelectTrigger className="h-10 rounded-xl text-sm bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8">
                  <SelectValue placeholder="Select category…" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-white/8 bg-white dark:bg-[#1e2130] shadow-xl">
                  {categories.map((c) => <SelectItem key={c._id} value={c._id} className="text-sm">{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Name */}
          <div>
            <LabelEl>Name <span className="text-red-400 normal-case">*</span></LabelEl>
            <input value={form.name} onChange={(e) => { setForm((prev: any) => ({ ...prev, name: e.target.value })); clearError("name"); }} className={`${inputBase} ${errors.name ? inputErr : inputOk}`} />
            <ErrTxt msg={errors.name} />
          </div>

          {/* Description */}
          <div>
            <LabelEl>Description <span className="text-slate-400 font-medium normal-case">(optional)</span></LabelEl>
            <input value={form.description} onChange={(e) => { setForm((prev: any) => ({ ...prev, description: e.target.value })); clearError("description"); }} className={`${inputBase} ${errors.description ? inputErr : inputOk}`} />
            <ErrTxt msg={errors.description} />
          </div>

          {/* Image */}
          <div>
            <LabelEl>Image <span className="text-slate-400 font-medium normal-case">(optional)</span></LabelEl>
            <div className="flex gap-2 items-center">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => { setForm((prev: any) => ({ ...prev, imageFile: e.target.files?.[0] || null })); clearError("imageFile"); }}
                className={`flex-1 h-10 rounded-xl border px-3 text-sm bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 file:mr-3 file:text-xs file:font-semibold file:text-indigo-600 dark:file:text-indigo-400 file:bg-transparent file:border-0 file:py-2 ${errors.imageFile ? "border-red-400" : "border-slate-200 dark:border-white/8"}`} />
              <div className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/8 overflow-hidden bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                {previewSrc
                  ? <img src={previewSrc} alt="Preview" className="h-full w-full object-cover" />
                  : <ImageIcon className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
            <ErrTxt msg={errors.imageFile} />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <LabelEl>Price (₹) <span className="text-red-400 normal-case">*</span></LabelEl>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => { setForm((prev: any) => ({ ...prev, price: e.target.value })); clearError("price"); }} placeholder="0.00" className={`${inputBase} ${errors.price ? inputErr : inputOk}`} />
              <ErrTxt msg={errors.price} />
            </div>
            <div>
              <LabelEl>Stock Qty <span className="text-red-400 normal-case">*</span></LabelEl>
              <input type="number" min="0" step="1" value={form.stockQuantity} onChange={(e) => { setForm((prev: any) => ({ ...prev, stockQuantity: e.target.value })); clearError("stockQuantity"); }} placeholder="0" className={`${inputBase} ${errors.stockQuantity ? inputErr : inputOk}`} />
              <ErrTxt msg={errors.stockQuantity} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
