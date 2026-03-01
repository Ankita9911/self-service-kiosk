import type { OfferType } from "../types/menu.types";

export type OfferFilter = "ALL" | OfferType;

interface FilterChip {
  value: OfferFilter;
  label: string;
  emoji: string;
  activeClass: string;
}

const CHIPS: FilterChip[] = [
  { value: "ALL",        label: "All",         emoji: "",   activeClass: "bg-gray-900 text-white" },
  { value: "DISCOUNT",   label: "Deals",       emoji: "🏷️", activeClass: "bg-red-500 text-white" },
  { value: "BOGO",       label: "Buy 1 Get 1", emoji: "🎁", activeClass: "bg-emerald-500 text-white" },
  { value: "BESTSELLER", label: "Best Seller", emoji: "⭐", activeClass: "bg-amber-500 text-white" },
  { value: "NEW",        label: "New",         emoji: "✨", activeClass: "bg-blue-500 text-white" },
  { value: "LIMITED",    label: "Limited",     emoji: "⏳", activeClass: "bg-orange-500 text-white" },
];

interface KioskFilterStripProps {
  active: OfferFilter;
  onChange: (f: OfferFilter) => void;
  counts: Partial<Record<OfferFilter, number>>;
}

export default function KioskFilterStrip({ active, onChange, counts }: KioskFilterStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-6 py-3 scrollbar-none bg-white border-b border-slate-100">
      {CHIPS.map(({ value, label, emoji, activeClass }) => {
        const count = counts[value];
        const isActive = active === value;
        // Hide chips with 0 items (except ALL)
        if (value !== "ALL" && count === 0) return null;

        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 border ${
              isActive
                ? `${activeClass} border-transparent shadow-md`
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          >
            {emoji && <span>{emoji}</span>}
            <span>{label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/25 text-current" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
