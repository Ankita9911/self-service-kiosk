import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { editDeviceSchema } from "../validations/device.schemas";

interface Props {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  onSave: (name: string) => Promise<void>;
}

export function EditDeviceModal({ open, onClose, initialName, onSave }: Props) {
  const [name, setName] = useState(initialName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setName(initialName || ""); setError(null); }
  }, [open, initialName]);

  function validate(value: string): boolean {
    const result = editDeviceSchema.safeParse({ name: value });
    if (result.success) { setError(null); return true; }
    setError(result.error.issues[0].message);
    return false;
  }

  function handleChange(value: string) {
    setName(value);
    if (error) validate(value);
  }

  async function handleSubmit() {
    if (!validate(name)) return;
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
          <DialogTitle className="font-clash-semibold">Rename Device</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Input
            value={name}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter device name"
            className={`font-satoshi border transition-all ${error ? "border-red-400 focus-visible:ring-red-400/40 focus-visible:border-red-400" : "border-slate-200 focus-visible:ring-orange-400/40"}`}
          />
          {error && (
            <p className="text-[11px] text-red-500 flex items-center gap-1">
              <span className="inline-block h-1 w-1 rounded-full bg-red-500" />{error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}