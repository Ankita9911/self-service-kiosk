import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { BadgeIndianRupee, Layers, Sparkles } from "lucide-react";
import type { Combo } from "../types/menu.types";

interface Props {
  open: boolean;
  combo: Combo | null;
  quantityInCart: number;
  onClose: () => void;
  onAddToCart: (combo: Combo) => void;
}

function serviceTypeLabel(serviceType?: Combo["serviceType"]) {
  if (serviceType === "DINE_IN") return "Dine In";
  if (serviceType === "TAKE_AWAY") return "Take Away";
  return "Dine In + Take Away";
}

export default function ComboDetailsDialog({
  open,
  combo,
  quantityInCart,
  onClose,
  onAddToCart,
}: Props) {
  if (!combo) return null;

  const savings = Math.max(0, (combo.originalPrice ?? 0) - combo.comboPrice);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden border-2 border-orange-200 bg-white">
        <div className="relative">
          <div className="relative aspect-video bg-linear-to-br from-orange-100 via-amber-50 to-orange-100">
            {combo.imageUrl ? (
              <img
                src={combo.imageUrl}
                alt={combo.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-7xl">
                🍱
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent" />

            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-black text-orange-600 shadow-md">
                COMBO SPECIAL
              </span>
              {savings > 0 && (
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow-md">
                  SAVE Rs {savings.toFixed(0)}
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <DialogTitle
                className="text-3xl font-black leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {combo.name}
              </DialogTitle>
              {combo.description && (
                <p
                  className="mt-1 text-sm text-orange-50"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {combo.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-[11px] font-bold text-orange-700">
              <Layers className="w-3 h-3" /> {combo.items.length} items included
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700">
              <Sparkles className="w-3 h-3" />{" "}
              {serviceTypeLabel(combo.serviceType)}
            </span>
          </div>

          <div className="rounded-2xl border-2 border-orange-100 bg-orange-50/70 p-4">
            <p
              className="mb-2 text-[11px] font-bold uppercase tracking-wider text-orange-600"
              style={{ fontFamily: "var(--font-body)" }}
            >
              This Combo Includes
            </p>
            <div className="space-y-2">
              {combo.items.map((item, index) => (
                <div
                  key={`${item.menuItemId}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2 border border-orange-100"
                >
                  <span
                    className="text-sm font-semibold text-gray-800"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {item.name}
                  </span>
                  <span className="rounded-lg bg-orange-500 px-2 py-0.5 text-[11px] font-black text-white">
                    {item.quantity}x
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p
                  className="text-[11px] font-bold uppercase tracking-wider text-gray-500"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Combo Price
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  {combo.originalPrice > combo.comboPrice && (
                    <span
                      className="text-sm text-gray-400 line-through"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Rs {combo.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span
                    className="text-3xl font-black text-orange-600"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Rs {combo.comboPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAddToCart(combo)}
                className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-br from-orange-500 to-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-300 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-95"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <BadgeIndianRupee className="h-4 w-4" /> Add Combo
              </button>
            </div>

            {quantityInCart > 0 && (
              <p
                className="mt-2 text-xs font-bold text-emerald-600"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {quantityInCart} in your cart
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
