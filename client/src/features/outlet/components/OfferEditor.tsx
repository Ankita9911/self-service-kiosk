import { Plus, X } from "lucide-react";
import type { OfferType, ItemOfferForm } from "@/features/outlet/types/outlet.types";

const OFFER_TYPES: { value: OfferType; label: string; emoji: string; color: string }[] = [
  { value: "DISCOUNT",   label: "Discount %",    emoji: "🏷️", color: "red" },
  { value: "BOGO",       label: "Buy 1 Get 1",   emoji: "🎁", color: "emerald" },
  { value: "BESTSELLER", label: "Best Seller",   emoji: "⭐", color: "amber" },
  { value: "NEW",        label: "New",           emoji: "✨", color: "blue" },
  { value: "LIMITED",    label: "Limited",       emoji: "⏳", color: "orange" },
];

const COLOR_MAP: Record<string, { active: string; btn: string }> = {
  red:     { active: "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400",     btn: "bg-red-500 hover:bg-red-600" },
  emerald: { active: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400", btn: "bg-emerald-500 hover:bg-emerald-600" },
  amber:   { active: "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400",   btn: "bg-amber-500 hover:bg-amber-600" },
  blue:    { active: "bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400",     btn: "bg-blue-500 hover:bg-blue-600" },
  orange:  { active: "bg-orange-50 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/30 text-orange-700 dark:text-orange-400", btn: "bg-orange-500 hover:bg-orange-600" },
};

interface OfferEditorProps {
  offers: ItemOfferForm[];
  onChange: (offers: ItemOfferForm[]) => void;
}

export function OfferEditor({ offers, onChange }: OfferEditorProps) {
  function addOffer(type: OfferType) {
    if (offers.some((o) => o.type === type)) return; // one of each type
    onChange([...offers, { type, discountPercent: type === "DISCOUNT" ? 10 : undefined }]);
  }

  function removeOffer(type: OfferType) {
    onChange(offers.filter((o) => o.type !== type));
  }

  function updateDiscount(type: OfferType, val: string) {
    onChange(offers.map((o) => o.type === type ? { ...o, discountPercent: parseFloat(val) || 0 } : o));
  }

  const activeTypes = offers.map((o) => o.type);

  return (
    <div className="space-y-3">
      {/* Type selector buttons */}
      <div className="flex flex-wrap gap-2">
        {OFFER_TYPES.map(({ value, label, emoji, color }) => {
          const isActive = activeTypes.includes(value);
          const col = COLOR_MAP[color];
          return (
            <button
              key={value}
              type="button"
              onClick={() => isActive ? removeOffer(value) : addOffer(value)}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-xl border text-xs font-bold transition-all ${
                isActive
                  ? `${col.active} border shadow-sm`
                  : "border-slate-200 dark:border-white/8 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-500/40"
              }`}
            >
              <span>{emoji}</span>
              {label}
              {isActive && <X className="w-3 h-3 ml-0.5 opacity-60" />}
            </button>
          );
        })}
      </div>

      {/* Discount % input if DISCOUNT is active */}
      {offers.find((o) => o.type === "DISCOUNT") && (
        <div className="flex items-center gap-2 pl-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Discount %</span>
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={offers.find((o) => o.type === "DISCOUNT")?.discountPercent ?? ""}
            onChange={(e) => updateDiscount("DISCOUNT", e.target.value)}
            className="w-20 px-2 h-8 rounded-lg border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400"
            placeholder="10"
          />
          <span className="text-xs text-slate-400">%</span>
        </div>
      )}

      {offers.length > 0 && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Badges will appear on kiosk item cards. Discounts apply automatically in cart.
        </p>
      )}
    </div>
  );
}
