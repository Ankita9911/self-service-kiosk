import { useState } from "react";
import type { CartItem } from "../types/cartItem.types";

/** Total price charged for a cart line after applying any offer */
export function effectiveLineTotal(item: CartItem): number {
  if (item.isCombo) return item.price * item.quantity;
  if (item.offerType === "BOGO") {
    // Every 2nd item is free: pay for ceil(qty/2)
    return item.price * Math.ceil(item.quantity / 2);
  }
  if (item.offerType === "DISCOUNT" && item.discountPercent) {
    return item.price * (1 - item.discountPercent / 100) * item.quantity;
  }
  return item.price * item.quantity;
}

/** Effective display unit price */
export function effectiveUnitPrice(item: CartItem): number {
  if (item.isCombo) return item.price;
  if (item.offerType === "BOGO" && item.quantity > 1) {
    return (item.price * Math.ceil(item.quantity / 2)) / item.quantity;
  }
  if (item.offerType === "DISCOUNT" && item.discountPercent) {
    return item.price * (1 - item.discountPercent / 100);
  }
  return item.price;
}

export function useKioskCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleAddToCart = (item: any) => {
    setCart((prev) => {
      const id = item._id ?? item.itemId;
      const existing = prev.find((c) => c.itemId === id);

      if (existing) {
        const stockLimit = item.stockQuantity ?? existing.stockQuantity ?? Infinity;
        if (existing.quantity >= stockLimit) return prev;
        return prev.map((c) =>
          c.itemId === id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }

      const firstOffer = item.offers?.[0];
      return [
        ...prev,
        {
          itemId: id,
          name: item.name,
          price: item.comboPrice ?? item.price,
          quantity: 1,
          stockQuantity: item.stockQuantity ?? 999,
          offerType: firstOffer?.type,
          discountPercent: firstOffer?.discountPercent,
          isCombo: !!item.comboPrice,
        } as CartItem,
      ];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
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
