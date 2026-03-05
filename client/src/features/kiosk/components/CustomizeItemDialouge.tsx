import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import type { MenuItem } from "../types/menu.types";

interface CustomizeItemDialogProps {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (customizationItemIds: string[]) => void;
}

export default function CustomizeItemDialog({
  open,
  item,
  onClose,
  onConfirm,
}: CustomizeItemDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const options = useMemo(() => item?.customizationOptions ?? [], [item]);

  const total = useMemo(() => {
    const selectedTotal = options
      .filter((opt) => selectedIds.includes(opt.itemId))
      .reduce((sum, opt) => sum + opt.price, 0);
    return (item?.price || 0) + selectedTotal;
  }, [item?.price, options, selectedIds]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedIds([]);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg rounded-3xl border-4 border-orange-500 p-0 overflow-hidden">
        <div className="p-6 border-b border-orange-100 bg-gradient-to-r from-orange-500 to-orange-600">
          <DialogTitle className="text-2xl font-black text-white">Customize Item</DialogTitle>
          <p className="text-orange-100 text-sm font-semibold mt-1">{item?.name}</p>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {options.length === 0 ? (
            <p className="text-sm text-gray-500">No customization options available.</p>
          ) : (
            options.map((opt) => {
              const checked = selectedIds.includes(opt.itemId);
              const disabled = opt.stockQuantity <= 0;
              return (
                <label
                  key={opt.itemId}
                  className={`flex items-center justify-between rounded-2xl border-2 p-3 ${
                    disabled
                      ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                      : checked
                        ? "border-orange-300 bg-orange-50"
                        : "border-gray-200 bg-white cursor-pointer hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => {
                        if (checked) {
                          setSelectedIds((prev) => prev.filter((id) => id !== opt.itemId));
                        } else {
                          setSelectedIds((prev) => [...prev, opt.itemId]);
                        }
                      }}
                      className="h-4 w-4 accent-orange-500"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{opt.name}</p>
                      <p className="text-xs text-gray-500">
                        {disabled ? "Out of stock" : `Stock: ${opt.stockQuantity}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-orange-600">+ Rs {opt.price.toFixed(2)}</p>
                </label>
              );
            })
          )}
        </div>

        <div className="p-6 border-t border-gray-100 space-y-3">
          <div className="flex justify-between text-sm font-bold text-gray-700">
            <span>Total (per item)</span>
            <span className="text-orange-600">Rs {total.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => onConfirm(selectedIds)}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
