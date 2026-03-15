import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { CartItem } from "../types/cartItem.types";

type AddToCartInput = {
  _id?: string;
  itemId?: string;
  name: string;
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
  const [cart, setCart] = useState<CartItem[]>([]);

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
        return prev.map((c) =>
          c.cartItemId === existing.cartItemId
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }

      const firstOffer = item.offers?.[0];
      return [
        ...prev,
        {
          cartItemId: uuidv4(),
          itemId: id,
          name: item.name,
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
    setCart((prev) =>
      prev
        .map((i) =>
          i.cartItemId === cartItemId
            ? { ...i, quantity: i.quantity + delta }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
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
