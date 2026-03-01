import type { ItemOffer, OfferType } from "../types/menu.types";

const OFFER_CONFIG: Record<
  OfferType,
  { label: (o: ItemOffer) => string; className: string }
> = {
  DISCOUNT: {
    label: (o) => o.discountPercent ? `${o.discountPercent}% OFF` : o.label ?? "OFFER",
    className: "bg-red-500 text-white",
  },
  BOGO: {
    label: () => "BUY 1 GET 1",
    className: "bg-emerald-500 text-white",
  },
  NEW: {
    label: () => "✨ NEW",
    className: "bg-blue-500 text-white",
  },
  BESTSELLER: {
    label: () => "⭐ BEST SELLER",
    className: "bg-amber-500 text-white",
  },
  LIMITED: {
    label: () => "⏳ LIMITED",
    className: "bg-orange-500 text-white",
  },
};

interface OfferBadgeProps {
  offer: ItemOffer;
  size?: "sm" | "md";
}

export function OfferBadge({ offer, size = "md" }: OfferBadgeProps) {
  const config = OFFER_CONFIG[offer.type];
  if (!config) return null;

  const text = offer.label || config.label(offer);
  const sizeClass = size === "sm"
    ? "text-[9px] px-1.5 py-0.5"
    : "text-[10px] px-2 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-black tracking-wide shadow-sm ${config.className} ${sizeClass}`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {text}
    </span>
  );
}

// Admin-side badge (dark mode aware)
const ADMIN_OFFER_CONFIG: Record<
  OfferType,
  { label: (o: ItemOffer) => string; className: string }
> = {
  DISCOUNT: {
    label: (o) => o.discountPercent ? `${o.discountPercent}% OFF` : "OFFER",
    className: "bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-400/20",
  },
  BOGO: {
    label: () => "BUY 1 GET 1",
    className: "bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-400/20",
  },
  NEW: {
    label: () => "✨ New",
    className: "bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-400/20",
  },
  BESTSELLER: {
    label: () => "⭐ Best Seller",
    className: "bg-amber-50 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-400/20",
  },
  LIMITED: {
    label: () => "⏳ Limited",
    className: "bg-orange-50 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-400/20",
  },
};

export function AdminOfferBadge({ offer }: { offer: ItemOffer }) {
  const config = ADMIN_OFFER_CONFIG[offer.type];
  if (!config) return null;
  const text = offer.label || config.label(offer);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${config.className}`}>
      {text}
    </span>
  );
}
