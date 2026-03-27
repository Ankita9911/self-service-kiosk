import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ImageOff } from "lucide-react";
import { trackDialog, trackEvent } from "@/features/kiosk/telemetry";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import type { MenuItem } from "../types/menu.types";
import { OfferBadge } from "./OfferBadge";

interface CustomizeItemDialogProps {
  open: boolean;
  item: MenuItem | null;
  initialQuantity?: number;
  maxQuantity?: number;
  onClose: () => void;
  onConfirm: (customizationItemIds: string[], quantity: number) => void;
}

export default function CustomizeItemDialog({
  open,
  item,
  initialQuantity = 0,
  maxQuantity = Number.POSITIVE_INFINITY,
  onClose,
  onConfirm,
}: CustomizeItemDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const options = useMemo(() => item?.customizationOptions ?? [], [item]);

  useEffect(() => {
    if (open && item) {
      setQuantity(initialQuantity);
      trackDialog({
        name: "kiosk.customization_dialog_opened",
        page: "menu",
        component: "customization_dialog",
        action: "open",
        target: String(item._id),
        payload: {
          optionCount: options.length,
          initialQuantity,
        },
      });
    }
  }, [item, open, options.length, initialQuantity]);

  const total = useMemo(() => {
    const selectedTotal = options
      .filter((opt) => selectedIds.includes(opt.itemId))
      .reduce((sum, opt) => sum + opt.price, 0);
    return ((item?.price || 0) + selectedTotal) * quantity;
  }, [item?.price, options, quantity, selectedIds]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          if (item) {
            trackDialog({
              name: "kiosk.customization_cancelled",
              page: "menu",
              component: "customization_dialog",
              action: "close",
              target: String(item._id),
              payload: {
                reason: "dismiss",
                selectedCount: selectedIds.length,
                quantity,
              },
            });
          }
          setSelectedIds([]);
          setQuantity(initialQuantity);
          onClose();
        }
      }}
    >
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full sm:max-w-xl rounded-[30px]! sm:rounded-[30px]! border border-[#cce9e2] p-0 overflow-hidden bg-white shadow-[0_20px_60px_rgba(14,159,137,0.22)]">
        <div className="relative h-58 bg-linear-to-br from-[#e9f8f4] via-white to-[#def5ee] overflow-hidden">
          {item?.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="w-14 h-14 text-[#8bcfc2]" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/5 to-transparent" />
          <div className="absolute bottom-3 left-4 rounded-full border border-white/40 bg-white/20 backdrop-blur-md px-3 py-1">
            <p className="text-xs font-bold text-white tracking-wide uppercase">
              Add Item
            </p>
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-5 max-h-[56vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                {item?.name || "Item"}
              </DialogTitle>
              {item?.description && (
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-md">
                  {item.description}
                </p>
              )}
              {!!item?.offers?.length && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {item.offers.map((offer, idx) => (
                    <OfferBadge
                      key={`${item._id}-modal-offer-${idx}`}
                      offer={offer}
                      size="sm"
                    />
                  ))}
                </div>
              )}
              {item?.stockQuantity === 0 && (
                <p className="mt-2 text-xs font-semibold text-red-500">
                  Out of stock
                </p>
              )}
            </div>
            <p className="text-3xl font-black text-[#0e9f89] whitespace-nowrap">
              ₹{item?.price?.toFixed(0) || "0"}
            </p>
          </div>

          {options.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                Customize Your Item
              </p>
              {options.map((opt) => {
                const checked = selectedIds.includes(opt.itemId);
                const disabled = opt.stockQuantity <= 0;
                return (
                  <label
                    key={opt.itemId}
                    className={`flex items-center justify-between rounded-2xl border p-3.5 transition-all ${
                      disabled
                        ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                        : checked
                          ? "border-[#83d8c9] bg-[#edf9f6]"
                          : "border-slate-200 bg-white cursor-pointer hover:border-[#b4e6dc]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => {
                          const nextChecked = !checked;
                          trackEvent({
                            name: "kiosk.customization_option_toggled",
                            page: "menu",
                            component: "customization_dialog",
                            action: "toggle_option",
                            target: String(item?._id ?? ""),
                            payload: {
                              optionId: opt.itemId,
                              selected: nextChecked,
                            },
                          });
                          if (checked) {
                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== opt.itemId),
                            );
                          } else {
                            setSelectedIds((prev) => [...prev, opt.itemId]);
                          }
                        }}
                        className="h-4 w-4 accent-[#0e9f89]"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {opt.name}
                        </p>
                        {disabled && (
                          <p className="text-xs text-red-500">Out of stock</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-black text-[#0e9f89]">
                      + ₹{opt.price.toFixed(0)}
                    </p>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 md:p-5 border-t border-[#e4f3ef] bg-[#fbfefe]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center rounded-2xl border border-[#cdebe4] bg-white p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setQuantity((q) => {
                    const nextQuantity = Math.max(0, q - 1);
                    if (nextQuantity !== q) {
                      trackEvent({
                        name: "kiosk.customization_quantity_changed",
                        page: "menu",
                        component: "customization_dialog",
                        action: "change_quantity",
                        target: String(item?._id ?? ""),
                        payload: {
                          quantityBefore: q,
                          quantityAfter: nextQuantity,
                        },
                      });
                    }
                    return nextQuantity;
                  });
                }}
                className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-lg font-black text-slate-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuantity((q) => {
                    const nextQuantity = Math.min(maxQuantity, q + 1);
                    if (nextQuantity === q) return q;
                    trackEvent({
                      name: "kiosk.customization_quantity_changed",
                      page: "menu",
                      component: "customization_dialog",
                      action: "change_quantity",
                      target: String(item?._id ?? ""),
                      payload: {
                        quantityBefore: q,
                        quantityAfter: nextQuantity,
                      },
                    });
                    return nextQuantity;
                  });
                }}
                className="h-9 w-9 rounded-xl bg-[#0e9f89] text-white hover:bg-[#0b8b78] flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Total
              </p>
              <p className="text-2xl font-black text-[#0e9f89]">
                ₹{total.toFixed(0)}
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex gap-2.5">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl border-[#cdebe4] bg-white text-slate-600 font-semibold shadow-sm hover:bg-[#edf8f5] hover:border-[#9fded2] hover:text-[#0e9f89]"
              onClick={() => {
                if (item) {
                  trackDialog({
                    name: "kiosk.customization_cancelled",
                    page: "menu",
                    component: "customization_dialog",
                    action: "cancel",
                    target: String(item._id),
                    payload: {
                      reason: "cancel_button",
                      selectedCount: selectedIds.length,
                      quantity,
                    },
                  });
                }
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-[#0e9f89] hover:bg-[#0b8b78] text-white"
              onClick={() => {
                if (item) {
                  trackDialog({
                    name: "kiosk.customization_confirmed",
                    page: "menu",
                    component: "customization_dialog",
                    action: "confirm",
                    target: String(item._id),
                    payload: {
                      selectedCount: selectedIds.length,
                      quantity,
                      selectedOptionIds: selectedIds,
                    },
                  });
                }
                onConfirm(selectedIds, quantity);
              }}
            >
              {quantity === 0 ? "Remove from Cart" : "Update Cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
