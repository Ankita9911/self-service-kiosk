import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  form: {
    name: string;
    description: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
    }>
  >;
  onSubmit: () => Promise<void>;
}

export function AddCategoryModal({
  open,
  onClose,
  form,
  setForm,
  onSubmit,
}: Props) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              placeholder="e.g. Beverages"
            />
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Optional description"
            />
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
            Create Category
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}