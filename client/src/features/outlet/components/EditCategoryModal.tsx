import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { toast } from "react-hot-toast";
import { categorySchema } from "../validations/menu.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";
import { useState } from "react";
import { Tag, X, RefreshCcw, ImageIcon } from "lucide-react";
import type { CategoryFormState } from "../types/outlet.types";

interface Props {
  open: boolean;
  onClose: () => void;
  form: CategoryFormState;
  setForm: React.Dispatch<React.SetStateAction<CategoryFormState>>;
  onSubmit: () => Promise<void>;
}

const inputBase =
  "w-full px-3 h-10 rounded-xl border bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all";
const inputOk =
  "border-slate-200 dark:border-white/8 focus:ring-indigo-500/30 focus:border-indigo-400";
const inputErr = "border-red-400 focus:ring-red-400/30 focus:border-red-400";

const LabelEl = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
    {children}
  </label>
);

export function EditCategoryModal({
  open,
  onClose,
  form,
  setForm,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const result = categorySchema.safeParse({
      name: form.name,
      description: form.description,
    });
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors = getZodFieldErrors<{
      name: string;
      description: string;
    }>(result.error);
    setErrors(fieldErrors);
    return false;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit();
      setErrors({});
      toast.success("Category updated successfully!");
      onClose();
    } catch {
      toast.error("Failed to update category. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  }

  const previewSrc = form.imageFile
    ? URL.createObjectURL(form.imageFile)
    : form.imageUrl;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-0 border border-slate-100 dark:border-white/8 bg-white dark:bg-[#1e2130] rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center">
              <Tag className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Edit Category
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Update category details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4"
          noValidate
        >
          <div>
            <LabelEl>
              Name <span className="text-red-400 normal-case">*</span>
            </LabelEl>
            <input
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="e.g. Beverages"
              className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-400" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <LabelEl>
              Description{" "}
              <span className="text-slate-400 font-medium normal-case">
                (optional)
              </span>
            </LabelEl>
            <input
              value={form.description}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, description: e.target.value }));
                if (errors.description)
                  setErrors((p) => ({ ...p, description: undefined }));
              }}
              placeholder="Optional description"
              className={`${inputBase} ${errors.description ? inputErr : inputOk}`}
            />
            {errors.description && (
              <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-400" />
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <LabelEl>
              Image{" "}
              <span className="text-slate-400 font-medium normal-case">
                (optional)
              </span>
            </LabelEl>
            <div className="flex gap-2 items-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    imageFile: e.target.files?.[0] || null,
                  }));
                }}
                className="flex-1 h-10 rounded-xl border px-3 text-sm bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 file:mr-3 file:text-xs file:font-semibold file:text-indigo-600 dark:file:text-indigo-400 file:bg-transparent file:border-0 file:py-2 border-slate-200 dark:border-white/8"
              />
              <div className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/8 overflow-hidden bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                "Save Category"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
