import { useEffect, useState } from "react";
import kioskAxios from "@/shared/lib/kioskAxios";
import type { MenuCategory } from "../types/menu.types";
import { toast } from "react-hot-toast";

const ALL_CATEGORY_ID = "__ALL__";

export function useKioskMenu() {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(ALL_CATEGORY_ID);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    try {
      setIsLoading(true);
      const response = await kioskAxios.get("/kiosk/menu");
      const freshMenu = response.data.data.sort(
        (a: any, b: any) =>
          (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      );
      const valid = freshMenu.filter(
        (c: any) => c.items && c.items.length > 0
      );
      setMenu(valid);
      toast.success("Menu loaded successfully");
    } catch {
      toast.error("Unable to load menu");
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  }

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