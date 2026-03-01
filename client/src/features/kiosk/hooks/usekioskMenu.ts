import { useEffect, useState, useCallback } from "react";
import kioskAxios from "@/shared/lib/kioskAxios";
import type { MenuCategory } from "../types/menu.types";
import { useMenuSocket } from "@/shared/hooks/useMenuSocket";

const ALL_CATEGORY_ID = "__ALL__";

function getOrderType(): "DINE_IN" | "TAKE_AWAY" | null {
  const t = localStorage.getItem("kiosk_order_type");
  if (t === "DINE_IN" || t === "TAKE_AWAY") return t;
  return null;
}

function filterByOrderType(items: any[]): any[] {
  const orderType = getOrderType();
  if (!orderType) return items;
  return items.filter((item) => {
    const st = item.serviceType ?? "BOTH";
    return st === "BOTH" || st === orderType;
  });
}

export function useKioskMenu() {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(ALL_CATEGORY_ID);
  const [isLoading, setIsLoading] = useState(true);

  const loadMenu = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const response = await kioskAxios.get("/kiosk/menu");
      const freshMenu = response.data.data.sort(
        (a: any, b: any) =>
          (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      );
      const valid = freshMenu.filter(
        (c: any) => c.items && c.items.length > 0
      );
      setMenu(valid);
    } catch {
      // silently ignore menu load errors
    } finally {
      if (!silent) setTimeout(() => setIsLoading(false), 500);
      else setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Silently reload whenever the queue worker finishes a menu change
  useMenuSocket(() => loadMenu(true));

  const rawItems =
    selectedCategory === ALL_CATEGORY_ID
      ? menu.flatMap((cat) => cat.items || [])
      : menu.find((c) => c._id === selectedCategory)?.items || [];

  const selectedItems = filterByOrderType(rawItems);

  const filteredMenu: MenuCategory[] = menu
    .map((cat) => ({ ...cat, items: filterByOrderType(cat.items || []) }))
    .filter((cat) => cat.items.length > 0);

  const categoriesWithAll: MenuCategory[] = [
    {
      _id: ALL_CATEGORY_ID,
      name: "All",
      items: filterByOrderType(menu.flatMap((c) => c.items || [])),
    } as MenuCategory,
    ...filteredMenu,
  ];

  return {
    menu,
    selectedCategory,
    setSelectedCategory,
    selectedItems,
    categoriesWithAll,
    isLoading,
    loadMenu,
  };
}