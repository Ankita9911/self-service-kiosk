import type { CartItem } from "../types/cartItem.types";
import type { Combo, MenuCategory, MenuItem } from "../types/menu.types";

export interface CartReconcileResult {
  cart: CartItem[];
  alerts: string[];
  changed: boolean;
}

export function reconcileCartWithCatalog(
  cart: CartItem[],
  menu: MenuCategory[],
  combos: Combo[]
): CartReconcileResult {
  const menuById = new Map<string, MenuItem>();
  const comboById = new Map<string, Combo>();

  for (const category of menu) {
    for (const item of category.items || []) {
      menuById.set(String(item._id), item);
    }
  }
  for (const combo of combos) {
    comboById.set(String(combo._id), combo);
  }

  const nextCart: CartItem[] = [];
  const alerts: string[] = [];

  for (const cartItem of cart) {
    if (cartItem.isCombo) {
      const combo = comboById.get(cartItem.itemId);
      if (!combo || combo.isActive === false) {
        alerts.push(`${cartItem.name} was removed because it is no longer available.`);
        continue;
      }
      const nextPrice = combo.comboPrice ?? cartItem.price;
      if (nextPrice !== cartItem.price) {
        alerts.push(`${cartItem.name} price changed: Rs ${cartItem.price.toFixed(2)} -> Rs ${nextPrice.toFixed(2)}.`);
      }
      nextCart.push({ ...cartItem, price: nextPrice });
      continue;
    }

    const liveItem = menuById.get(cartItem.itemId);
    if (!liveItem || liveItem.isActive === false || liveItem.stockQuantity <= 0) {
      alerts.push(`${cartItem.name} was removed because it is out of stock.`);
      continue;
    }

    const liveOptionsMap = new Map(
      (liveItem.customizationOptions || []).map((opt) => [opt.itemId, opt])
    );

    const nextSelectedOptions = [];
    for (const option of cartItem.selectedCustomizations || []) {
      const liveOption = liveOptionsMap.get(option.itemId);
      if (!liveOption || liveOption.stockQuantity <= 0) {
        alerts.push(`${option.name} was removed from ${cartItem.name} because it is unavailable.`);
        continue;
      }
      if (liveOption.price !== option.price) {
        alerts.push(`${option.name} price changed: Rs ${option.price.toFixed(2)} -> Rs ${liveOption.price.toFixed(2)}.`);
      }
      nextSelectedOptions.push({ ...option, price: liveOption.price, stockQuantity: liveOption.stockQuantity, name: liveOption.name });
    }

    const optionStockLimit = nextSelectedOptions.length
      ? Math.min(...nextSelectedOptions.map((opt) => opt.stockQuantity))
      : liveItem.stockQuantity;

    const effectiveStockLimit = Math.min(liveItem.stockQuantity, optionStockLimit);
    const reducedQuantity = Math.min(cartItem.quantity, effectiveStockLimit);

    if (reducedQuantity !== cartItem.quantity) {
      alerts.push(`${cartItem.name} quantity reduced from ${cartItem.quantity} to ${reducedQuantity} due to stock limits.`);
    }

    if (liveItem.price !== cartItem.price) {
      alerts.push(`${cartItem.name} price changed: Rs ${cartItem.price.toFixed(2)} -> Rs ${liveItem.price.toFixed(2)}.`);
    }

    const firstOffer = liveItem.offers?.[0];
    nextCart.push({
      ...cartItem,
      price: liveItem.price,
      quantity: reducedQuantity,
      stockQuantity: effectiveStockLimit,
      offerType: firstOffer?.type,
      discountPercent: firstOffer?.discountPercent,
      selectedCustomizations: nextSelectedOptions,
    });
  }

  return { cart: nextCart, alerts, changed: hasCartChanged(cart, nextCart) };
}

function hasCartChanged(prev: CartItem[], next: CartItem[]): boolean {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < prev.length; i++) {
    const a = prev[i];
    const b = next[i];
    if (
      a.cartItemId !== b.cartItemId ||
      a.itemId !== b.itemId ||
      a.price !== b.price ||
      a.quantity !== b.quantity ||
      a.stockQuantity !== b.stockQuantity ||
      a.offerType !== b.offerType ||
      a.discountPercent !== b.discountPercent ||
      JSON.stringify(a.selectedCustomizations ?? []) !== JSON.stringify(b.selectedCustomizations ?? [])
    ) return true;
  }
  return false;
}
