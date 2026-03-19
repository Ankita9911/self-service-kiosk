import { useMemo, useState } from "react";
import { Combobox } from "@/shared/components/ui/combobox";
import { X } from "lucide-react";
import type { MenuItem } from "@/features/kiosk/types/menu.types";

interface CustomizationPickerProps {
  items: MenuItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  excludeItemId?: string;
}

export function CustomizationPicker({
  items,
  selectedIds,
  onChange,
  excludeItemId,
}: CustomizationPickerProps) {
  const [selectedToAdd, setSelectedToAdd] = useState("");

  const byId = useMemo(() => {
    const map = new Map<string, MenuItem>();
    items.forEach((item) => map.set(item._id, item));
    return map;
  }, [items]);

  const available = items.filter(
    (item) => item._id !== excludeItemId && !selectedIds.includes(item._id),
  );

  const selectedItems = selectedIds
    .map((id) => byId.get(id))
    .filter(Boolean) as MenuItem[];

  const handleAdd = (id: string) => {
    if (!id) return;
    if (selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
    setSelectedToAdd("");
  };

  const options = available.map((item) => ({
    value: item._id,
    label: `${item.name} - Rs ${item.price.toFixed(2)}`,
  }));

  return (
    <div className="space-y-2.5">
      <Combobox
        variant="form"
        value={selectedToAdd}
        onValueChange={handleAdd}
        options={options}
        placeholder="Select items to add as customization..."
        searchPlaceholder="Search customization item..."
        emptyText="No more items available"
      />

      {selectedItems.length > 0 && (
        <div className="space-y-2">
          {selectedItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 bg-slate-50 dark:bg-white/5"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {item.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Rs {item.price.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onChange(selectedIds.filter((id) => id !== item._id))
                }
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
