import type { OfferType } from "../types/menu.types";

export type OfferFilter = "ALL" | OfferType;

interface FilterChip {
  value: OfferFilter;
  label: string;
  emoji: string;
}

const CHIPS: FilterChip[] = [
  {
    value: "ALL",
    label: "All",
    emoji: "",
  },
  {
    value: "DISCOUNT",
    label: "Deals",
    emoji: "🏷️",
  },
  {
    value: "BOGO",
    label: "Buy 1 Get 1",
    emoji: "🎁",
  },
  {
    value: "BESTSELLER",
    label: "Best Seller",
    emoji: "⭐",
  },
  {
    value: "NEW",
    label: "New",
    emoji: "✨",
  },
  {
    value: "LIMITED",
    label: "Limited",
    emoji: "⏳",
  },
];

interface KioskFilterStripProps {
  active: OfferFilter;
  onChange: (f: OfferFilter) => void;
  counts: Partial<Record<OfferFilter, number>>;
}

export default function KioskFilterStrip({
  active,
  onChange,
  counts,
}: KioskFilterStripProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto px-4 py-2.5 scrollbar-none bg-white border-b border-slate-100">
      {CHIPS.map(({ value, label, emoji }) => {
        const count = counts[value];
        const isActive = active === value;
        // Hide chips with 0 items (except ALL)
        if (value !== "ALL" && count === 0) return null;

        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className="shrink-0 flex flex-col items-center justify-start active:scale-95"
            style={{
              width: "88px",
              minHeight: "108px",
              borderRadius: "24px",
              padding: "8px 7px 9px",
              background: isActive
                ? "linear-gradient(170deg, #16b8a1 0%, #0e9f89 100%)"
                : "#ffffff",
              border: isActive
                ? "1px solid rgba(12, 154, 133, 0.75)"
                : "1px solid #eff1f3",
              boxShadow: isActive
                ? "0 8px 18px rgba(22, 184, 161, 0.32)"
                : "0 4px 12px rgba(15, 23, 42, 0.08)",
              gap: "7px",
              transition: "all 0.25s ease",
              fontFamily: "'DM Sans', 'Nunito', sans-serif",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: "#ffffff",
                boxShadow: isActive
                  ? "0 4px 10px rgba(6, 120, 104, 0.28)"
                  : "0 3px 8px rgba(0, 0, 0, 0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              {emoji || "📋"}
            </div>

            <span
              style={{
                fontSize: "10px",
                fontWeight: isActive ? 700 : 600,
                color: isActive ? "#ffffff" : "#475569",
                textAlign: "center",
                lineHeight: "1.2",
                maxWidth: "72px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minHeight: "24px",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
