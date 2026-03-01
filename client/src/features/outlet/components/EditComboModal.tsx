import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Plus, X, Layers, RefreshCcw, Minus } from "lucide-react";
import type { MenuItem } from "@/features/kiosk/types/menu.types";
import type { ServiceType } from "@/features/outlet/types/outlet.types";

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "DINE_IN",   label: "Dine In"   },
  { value: "TAKE_AWAY", label: "Take Away" },
  { value: "BOTH",      label: "Both"      },
];

const inputBase = "w-full px-3 h-10 rounded-xl border bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all border-slate-200 dark:border-white/8 focus:ring-indigo-500/30 focus:border-indigo-400";
const LabelEl = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{children}</label>
);

interface ComboItemEntry {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  combo: any;
  items: MenuItem[];
  onSubmit: (data: {
    name: string;
    description?: string;
    imageUrl?: string;
    items: { menuItemId: string; name: string; quantity: number }[];
    originalPrice: number;
    comboPrice: number;
    serviceType: ServiceType;
  }) => Promise<void>;
}

export function EditComboModal({ open, onClose, combo, items, onSubmit }: Props) {
  const [name, setName] = useState(combo?.name ?? "");
  const [description, setDescription] = useState(combo?.description ?? "");
  const [comboPrice, setComboPrice] = useState(String(combo?.comboPrice ?? ""));
  const [serviceType, setServiceType] = useState<ServiceType>(combo?.serviceType ?? "BOTH");
  const [selectedItems, setSelectedItems] = useState<ComboItemEntry[]>([]);
  const [addItemId, setAddItemId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialise from combo items (cross-reference with items list for prices)
  useEffect(() => {
    if (!combo) return;
    setName(combo.name ?? "");
    setDescription(combo.description ?? "");
    setComboPrice(String(combo.comboPrice ?? ""));
    setServiceType(combo.serviceType ?? "BOTH");

    const initialItems: ComboItemEntry[] = (combo.items ?? []).map((ci: any) => {
      const match = items.find((i) => i._id === ci.menuItemId);
      return {
        menuItemId: ci.menuItemId,
        name: ci.name,
        quantity: ci.quantity,
        price: match?.price ?? 0,
      };
    });
    setSelectedItems(initialItems);
  }, [combo, items]);

  const originalPrice = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);

  function addItem() {
    const found = items.find((i) => i._id === addItemId);
    if (!found) return;
    setSelectedItems((prev) => {
      const existing = prev.find((e) => e.menuItemId === found._id);
      if (existing) return prev.map((e) => e.menuItemId === found._id ? { ...e, quantity: e.quantity + 1 } : e);
      return [...prev, { menuItemId: found._id, name: found.name, quantity: 1, price: found.price }];
    });
    setAddItemId("");
  }

  function removeItem(id: string) {
    setSelectedItems((prev) => prev.filter((e) => e.menuItemId !== id));
  }

  function changeQty(id: string, delta: number) {
    setSelectedItems((prev) =>
      prev.map((e) => e.menuItemId === id ? { ...e, quantity: Math.max(1, e.quantity + delta) } : e)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comboPrice || selectedItems.length === 0) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        description: description || undefined,
        items: selectedItems.map(({ menuItemId, name, quantity }) => ({ menuItemId, name, quantity })),
        originalPrice,
        comboPrice: parseFloat(comboPrice),
        serviceType,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 border border-slate-100 dark:border-white/8 bg-white dark:bg-[#1e2130] rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Edit Combo</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Update combo details and pricing</p>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <LabelEl>Combo Name <span className="text-red-400 normal-case">*</span></LabelEl>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Family Feast" className={inputBase} required />
          </div>

          <div>
            <LabelEl>Description <span className="text-slate-400 font-medium normal-case">(optional)</span></LabelEl>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className={inputBase} />
          </div>

          {/* Available For */}
          <div>
            <LabelEl>Available For</LabelEl>
            <div className="flex gap-2">
              {SERVICE_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setServiceType(opt.value)}
                  className={`flex-1 h-9 rounded-xl border text-xs font-semibold transition-all ${
                    serviceType === opt.value ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 dark:border-white/8 text-slate-500 dark:text-slate-400"
                  }`}>{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Add items */}
          <div>
            <LabelEl>Combo Items <span className="text-red-400 normal-case">*</span></LabelEl>
            <div className="flex gap-2">
              <select
                value={addItemId}
                onChange={(e) => setAddItemId(e.target.value)}
                className="flex-1 px-3 h-10 rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="">Select item to add…</option>
                {items.map((i) => <option key={i._id} value={i._id}>{i.name} — ₹{i.price}</option>)}
              </select>
              <button type="button" onClick={addItem} disabled={!addItemId}
                className="h-10 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-40 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-2 space-y-2">
                {selectedItems.map((entry) => (
                  <div key={entry.menuItemId} className="flex items-center justify-between bg-slate-50 dark:bg-white/5 rounded-xl px-3 py-2 border border-slate-100 dark:border-white/8">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex-1 min-w-0 truncate">{entry.name}</span>
                    <span className="text-xs text-slate-400 mx-2">₹{(entry.price * entry.quantity).toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => changeQty(entry.menuItemId, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold text-slate-700 dark:text-white min-w-5 text-center">{entry.quantity}</span>
                      <button type="button" onClick={() => changeQty(entry.menuItemId, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => removeItem(entry.menuItemId)} className="ml-1 w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1 pt-1 border-t border-slate-100 dark:border-white/8">
                  <span>Original Price (sum)</span>
                  <span>₹{originalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Combo Price */}
          <div>
            <LabelEl>Combo Price (₹) <span className="text-red-400 normal-case">*</span></LabelEl>
            <input type="number" step="0.01" min="0" value={comboPrice} onChange={(e) => setComboPrice(e.target.value)} placeholder="0.00" className={inputBase} required />
            {comboPrice && originalPrice > 0 && parseFloat(comboPrice) < originalPrice && (
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Customer saves ₹{(originalPrice - parseFloat(comboPrice)).toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !name.trim() || !comboPrice || selectedItems.length === 0}
              className="flex-1 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <><Layers className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
