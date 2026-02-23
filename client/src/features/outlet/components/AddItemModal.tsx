import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

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
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Category *</Label>
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={form.categoryId}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  categoryId: e.target.value,
                }))
              }
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev: any) => ({ ...prev, name: e.target.value }))
              }
              required
              placeholder="e.g. Masala Chai"
            />
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Short description"
            />
          </div>

          <div>
            <Label>Image URL (optional)</Label>
            <Input
              value={form.imageUrl}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  imageUrl: e.target.value,
                }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm((prev: any) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                required
                placeholder="0"
              />
            </div>

            <div>
              <Label>Stock Qty *</Label>
              <Input
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={(e) =>
                  setForm((prev: any) => ({
                    ...prev,
                    stockQuantity: e.target.value,
                  }))
                }
                required
                placeholder="0"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
            Add Item
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}