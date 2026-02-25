import { useState } from "react";
import { toast } from "react-hot-toast";
import type { CartItem } from "../types/cartItem.types";

export function useKioskCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleAddToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === item._id);

      if (existing) {
        if (existing.quantity >= item.stockQuantity) {
          toast.error("Maximum quantity reached");
          return prev;
        }

        toast.success(`${item.name} quantity updated`, {
          duration: 1500,
        });

        return prev.map((c) =>
          c.itemId === item._id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }

      toast.success(`${item.name} added to cart!`, {
        duration: 1500,
      });

      return [
        ...prev,
        {
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          stockQuantity: item.stockQuantity,
        },
      ];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.itemId === itemId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const totalItems = cart.reduce(
    (acc, i) => acc + i.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0
  );

  return {
    cart,
    setCart,
    handleAddToCart,
    handleUpdateQuantity,
    totalItems,
    totalPrice,
  };
}