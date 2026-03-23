import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  BadgeIndianRupee,
  Layers,
  Minus,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Combo } from "../types/menu.types";

interface Props {
  open: boolean;
  combo: Combo | null;
  quantityInCart: number;
  comboItemMetaMap: Record<string, { imageUrl?: string; price?: number }>;
  onClose: () => void;
  onAddToCart: (combo: Combo, quantity: number) => void;
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
  comboItemMetaMap,
  onClose,
  onAddToCart,
}: Props) {
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  useEffect(() => {
    if (open) setQuantityToAdd(1);
  }, [open, combo?._id]);

  if (!combo) return null;

  const derivedOriginalPrice = combo.items.reduce((sum, item) => {
    const unitPrice = comboItemMetaMap[item.menuItemId]?.price ?? 0;
    return sum + unitPrice * item.quantity;
  }, 0);
  const effectiveOriginalPrice =
    combo.originalPrice && combo.originalPrice > 0
      ? combo.originalPrice
      : derivedOriginalPrice;
  const savings = Math.max(0, effectiveOriginalPrice - combo.comboPrice);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full sm:max-w-2xl rounded-[30px]! sm:rounded-[30px]! p-0 overflow-hidden border border-[#cdebe4] bg-white shadow-[0_24px_70px_rgba(14,159,137,0.2)]">
        <div className="relative">
          <div className="relative h-56 md:h-60 bg-linear-to-br from-[#e9f8f4] via-[#f6fdfb] to-[#e3f5f0]">
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
              <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-black text-[#0e9f89] shadow-md">
                COMBO SPECIAL
              </span>
              {savings > 0 && (
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow-md">
                  SAVE Rs {savings.toFixed(0)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-black/35 hover:bg-black/50 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Close combo details"
            >
              <X className="w-5 h-5" strokeWidth={2.8} />
            </button>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <DialogTitle
                className="text-3xl font-black leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {combo.name}
              </DialogTitle>
              {combo.description && (
                <p
                  className="mt-1 text-sm text-teal-50"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {combo.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[54vh] overflow-y-auto">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7f3] px-3 py-1 text-[11px] font-bold text-[#0e9f89]">
              <Layers className="w-3 h-3" /> {combo.items.length} items included
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#dff5ef] px-3 py-1 text-[11px] font-bold text-[#0b8b78]">
              <Sparkles className="w-3 h-3" />{" "}
              {serviceTypeLabel(combo.serviceType)}
            </span>
          </div>

          <div className="rounded-2xl border-2 border-[#d9eee8] bg-[#f3fbf9] p-4">
            <p
              className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#0e9f89]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              This Combo Includes
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {combo.items.map((item, index) => (
                <div
                  key={`${item.menuItemId}-${index}`}
                  className="rounded-2xl bg-white border border-[#dcefe9] p-2"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-[#e7f8f4]">
                    {comboItemMetaMap[item.menuItemId]?.imageUrl ? (
                      <img
                        src={comboItemMetaMap[item.menuItemId]?.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-3xl">
                        🍽️
                      </div>
                    )}

                    <span className="absolute top-1.5 right-1.5 rounded-lg bg-[#0e9f89] px-2 py-0.5 text-[11px] font-black text-white shadow-md">
                      {item.quantity}x
                    </span>
                  </div>

                  <p
                    className="mt-2 text-xs font-bold text-slate-700 leading-tight line-clamp-2"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#dcefe9] bg-[#f7fcfb] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  MRP Total
                </p>
                <p className="text-lg font-black text-slate-700 mt-1">
                  ₹{effectiveOriginalPrice.toFixed(2)}
                </p>
              </div>

              <div className="rounded-xl border border-[#bfe8de] bg-[#ecfaf6] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#0b8b78]">
                  Combo Price
                </p>
                <p className="text-lg font-black text-[#0e9f89] mt-1">
                  ₹{combo.comboPrice.toFixed(2)}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                  You Save
                </p>
                <p className="text-lg font-black text-emerald-600 mt-1">
                  ₹{savings.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="text-sm text-slate-500 font-semibold">
                Total for {quantityToAdd} item{quantityToAdd > 1 ? "s" : ""}
              </div>

              <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-md border border-[#dcefe9]">
                <button
                  type="button"
                  onClick={() => setQuantityToAdd((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
                >
                  <Minus className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <span className="text-xl font-black text-slate-800 min-w-8 text-center">
                  {quantityToAdd}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantityToAdd((q) => q + 1)}
                  className="w-9 h-9 rounded-xl bg-[#0e9f89] hover:bg-[#0b8b78] text-white flex items-center justify-center transition-all"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onAddToCart(combo, quantityToAdd);
                onClose();
              }}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#16b8a1] via-[#0e9f89] to-[#16b8a1] px-5 py-3.5 text-base font-black text-white shadow-lg shadow-[#8edfd1]/45 transition-all hover:from-[#0fb39a] hover:via-[#0b8b78] hover:to-[#0fb39a] active:scale-95"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <BadgeIndianRupee className="h-5 w-5" /> Add Combo • ₹
              {(combo.comboPrice * quantityToAdd).toFixed(2)}
            </button>

            {quantityInCart > 0 && (
              <p
                className="mt-2 text-xs font-bold text-[#0b8b78]"
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
