import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  form: {
    name: string;
    description: string;
    imageUrl?: string;
    imageFile: File | null;
    price: string;
    stockQuantity: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: () => Promise<void>;
}

export function EditItemModal({
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
          <DialogTitle>Edit Menu Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev: any) => ({ ...prev, name: e.target.value }))
              }
              required
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
            />
          </div>

          <div className="space-y-2">
            <Label>Image (optional)</Label>

            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  imageFile: e.target.files?.[0] || null,
                }))
              }
            />

            {/* Show new selected image preview */}
            {form.imageFile && (
              <div className="h-24 w-24 rounded-md overflow-hidden border">
                <img
                  src={URL.createObjectURL(form.imageFile)}
                  alt="New Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Show existing image if no new file selected */}
            {!form.imageFile && form.imageUrl && (
              <div className="h-24 w-24 rounded-md overflow-hidden border">
                <img
                  src={form.imageUrl}
                  alt="Current"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
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
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
