import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface Props {
  open: boolean;
  item: any | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteItemModal({
  open,
  item,
  onClose,
  onConfirm,
}: Props) {
  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Item?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-600">
          Remove &quot;{item?.name}&quot; from the menu? This cannot be undone.
        </p>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}