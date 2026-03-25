import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { trackCartMutation } from "@/features/kiosk/telemetry";
import type { CartItem } from "../types/cartItem.types";

const KIOSK_CART_STORAGE_KEY = "kiosk_cart_v1";

function readPersistedCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.sessionStorage.getItem(KIOSK_CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        cartItemId: String(item.cartItemId || uuidv4()),
        itemId: String(item.itemId || ""),
        name: String(item.name || ""),
        imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
        stockQuantity: Number(item.stockQuantity || 0),
        offerType: item.offerType,
        discountPercent:
          item.discountPercent !== undefined
            ? Number(item.discountPercent)
            : undefined,
        isCombo: Boolean(item.isCombo),
        selectedCustomizations: Array.isArray(item.selectedCustomizations)
          ? item.selectedCustomizations.map((opt: any) => ({
              itemId: String(opt.itemId || ""),
              name: String(opt.name || ""),
              price: Number(opt.price || 0),
              stockQuantity: Number(opt.stockQuantity || 0),
            }))
          : undefined,
      }))
      .filter((item) => item.itemId && item.name && item.quantity > 0);
  } catch {
    return [];
  }
}

type AddToCartInput = {
  _id?: string;
  itemId?: string;
  name: string;
  imageUrl?: string;
  price: number;
  comboPrice?: number;
  stockQuantity?: number;
  offers?: { type?: CartItem["offerType"]; discountPercent?: number }[];
  selectedCustomizations?: CartItem["selectedCustomizations"];
};

/** Total price charged for a cart line after applying any offer */
export function effectiveLineTotal(item: CartItem): number {
  const customizationsTotal = (item.selectedCustomizations || []).reduce(
    (sum, option) => sum + option.price,
    0,
  );
  const effectiveBaseUnitPrice = item.price + customizationsTotal;
  if (item.isCombo) return effectiveBaseUnitPrice * item.quantity;
  if (item.offerType === "BOGO") {
    // Every 2nd item is free: pay for ceil(qty/2)
    return effectiveBaseUnitPrice * Math.ceil(item.quantity / 2);
  }
  if (item.offerType === "DISCOUNT" && item.discountPercent) {
    return (
      effectiveBaseUnitPrice * (1 - item.discountPercent / 100) * item.quantity
    );
  }
  return effectiveBaseUnitPrice * item.quantity;
}

/** Effective display unit price */
export function effectiveUnitPrice(item: CartItem): number {
  const customizationsTotal = (item.selectedCustomizations || []).reduce(
    (sum, option) => sum + option.price,
    0,
  );
  const effectiveBaseUnitPrice = item.price + customizationsTotal;
  if (item.isCombo) return effectiveBaseUnitPrice;
  if (item.offerType === "BOGO" && item.quantity > 1) {
    return (
      (effectiveBaseUnitPrice * Math.ceil(item.quantity / 2)) / item.quantity
    );
  }
  if (item.offerType === "DISCOUNT" && item.discountPercent) {
    return effectiveBaseUnitPrice * (1 - item.discountPercent / 100);
  }
  return effectiveBaseUnitPrice;
}

export function useKioskCart() {
  const [cart, setCart] = useState<CartItem[]>(() => readPersistedCart());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (cart.length === 0) {
        window.sessionStorage.removeItem(KIOSK_CART_STORAGE_KEY);
        return;
      }
      window.sessionStorage.setItem(KIOSK_CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore persistence errors (storage unavailable/quota exceeded).
    }
  }, [cart]);

  const handleAddToCart = (item: AddToCartInput) => {
    const selectedCustomizations = (item.selectedCustomizations || []).map(
      (opt) => ({
        itemId: String(opt.itemId),
        name: opt.name,
        price: Number(opt.price),
        stockQuantity: Number(opt.stockQuantity ?? 0),
      }),
    );
    const customizationKey = selectedCustomizations
      .map((opt) => String(opt.itemId))
      .sort()
      .join("|");

    setCart((prev) => {
      const id = item._id ?? item.itemId;
      const existing = prev.find((c) => {
        if (c.itemId !== id) return false;
        const existingKey = (c.selectedCustomizations || [])
          .map((opt) => String(opt.itemId))
          .sort()
          .join("|");
        return existingKey === customizationKey;
      });

      if (existing) {
        const stockLimit =
          item.stockQuantity ?? existing.stockQuantity ?? Infinity;
        if (existing.quantity >= stockLimit) return prev;
        trackCartMutation({
          action: "add",
          itemId: existing.itemId,
          quantityBefore: existing.quantity,
          quantityAfter: existing.quantity + 1,
          payload: {
            cartItemId: existing.cartItemId,
            isCombo: existing.isCombo,
          },
        });
        return prev.map((c) =>
          c.cartItemId === existing.cartItemId
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }

      const firstOffer = item.offers?.[0];
      const cartItemId = uuidv4();
      trackCartMutation({
        action: "add",
        itemId: String(id),
        quantityBefore: 0,
        quantityAfter: 1,
        payload: {
          cartItemId,
          isCombo: Boolean(item.comboPrice),
        },
      });
      return [
        ...prev,
        {
          cartItemId,
          itemId: id,
          name: item.name,
          imageUrl: item.imageUrl,
          price: item.comboPrice ?? item.price,
          quantity: 1,
          stockQuantity: item.stockQuantity ?? 999,
          offerType: firstOffer?.type,
          discountPercent: firstOffer?.discountPercent,
          isCombo: !!item.comboPrice,
          selectedCustomizations,
        } as CartItem,
      ];
    });
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (!existing) return prev;

      const nextQuantity = existing.quantity + delta;

      if (nextQuantity <= 0) {
        trackCartMutation({
          action: "remove",
          itemId: existing.itemId,
          quantityBefore: existing.quantity,
          quantityAfter: 0,
          payload: {
            cartItemId: existing.cartItemId,
            isCombo: existing.isCombo,
          },
        });
      } else {
        trackCartMutation({
          action: "change",
          itemId: existing.itemId,
          quantityBefore: existing.quantity,
          quantityAfter: nextQuantity,
          payload: {
            cartItemId: existing.cartItemId,
            delta,
            isCombo: existing.isCombo,
          },
        });
      }

      return prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cart.reduce((acc, i) => acc + effectiveLineTotal(i), 0);
  const tax = subtotal * 0.05;
  const totalPrice = subtotal + tax;

  return {
    cart,
    setCart,
    handleAddToCart,
    handleUpdateQuantity,
    totalItems,
    totalPrice,
    subtotal,
  };
}
