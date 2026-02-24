import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface Props {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  onSave: (name: string) => Promise<void>;
}

export function EditDeviceModal({
  open,
  onClose,
  initialName,
  onSave,
}: Props) {
  const [name, setName] = useState(initialName || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName || "");
    }
  }, [open, initialName]);

  async function handleSubmit() {
    if (!name.trim()) return;

    try {
      setLoading(true);
      await onSave(name.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-clash-semibold">
            Rename Device
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter device name"
            className="font-satoshi"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}