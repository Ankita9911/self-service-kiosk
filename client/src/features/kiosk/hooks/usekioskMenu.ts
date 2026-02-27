import { useEffect, useState, useCallback } from "react";
import kioskAxios from "@/shared/lib/kioskAxios";
import type { MenuCategory } from "../types/menu.types";
import { toast } from "react-hot-toast";
import { useMenuSocket } from "@/shared/hooks/useMenuSocket";

const ALL_CATEGORY_ID = "__ALL__";

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
      if (!silent) toast.success("Menu loaded successfully");
    } catch {
      if (!silent) toast.error("Unable to load menu");
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

  const selectedItems =
    selectedCategory === ALL_CATEGORY_ID
      ? menu.flatMap((cat) => cat.items || [])
      : menu.find((c) => c._id === selectedCategory)?.items || [];

  const categoriesWithAll: MenuCategory[] = [
    {
      _id: ALL_CATEGORY_ID,
      name: "All",
      items: menu.flatMap((c) => c.items || []),
    } as MenuCategory,
    ...menu,
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