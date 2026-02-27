import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "react-hot-toast";
import { categorySchema } from "../validations/menu.schemas";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  form: { name: string; description: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;
  onSubmit: () => Promise<void>;
}

export function AddCategoryModal({ open, onClose, form, setForm, onSubmit }: Props) {
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  function validate(): boolean {
    const result = categorySchema.safeParse(form);
    if (result.success) { setErrors({}); return true; }
    const fieldErrors: { name?: string; description?: string } = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path[0] as "name" | "description";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    });
    setErrors(fieldErrors);
    return false;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit();
      setErrors({});
      toast.success("Successfully added category!");
    } catch {
      toast.error("Failed to add category. Please try again!");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => { setForm((prev) => ({ ...prev, name: e.target.value })); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
              placeholder="e.g. Beverages"
              className={`border transition-all ${errors.name ? "border-red-400 focus-visible:ring-red-400/40" : "border-slate-200"}`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-red-500" />{errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Input
              value={form.description}
              onChange={(e) => { setForm((prev) => ({ ...prev, description: e.target.value })); if (errors.description) setErrors((p) => ({ ...p, description: undefined })); }}
              placeholder="Optional description"
              className={`border transition-all ${errors.description ? "border-red-400" : "border-slate-200"}`}
            />
            {errors.description && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-red-500" />{errors.description}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Create Category</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}