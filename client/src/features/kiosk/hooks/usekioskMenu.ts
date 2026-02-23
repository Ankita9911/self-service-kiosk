import { useEffect, useState } from "react";
import kioskAxios from "@/shared/lib/kioskAxios";
import { getMenuFromCache, saveMenu } from "@/shared/lib/menuCache";
import type { MenuCategory } from "@/shared/lib/menuCache";
import { toast } from "sonner";

const ALL_CATEGORY_ID = "__ALL__";

export function useKioskMenu() {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(ALL_CATEGORY_ID);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu(silent = false) {
    try {
      if (!silent) setIsLoading(true);

      const cachedMenu = (await getMenuFromCache()) as MenuCategory[];

      if (cachedMenu?.length > 0) {
        const valid = cachedMenu.filter(
          (c) => c.items && c.items.length > 0
        );
        setMenu(valid);
      }

      try {
        const response = await kioskAxios.get("/kiosk/menu");
        const freshMenu = response.data.data.sort(
          (a: any, b: any) =>
            (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
        );

        const valid = freshMenu.filter(
          (c: any) => c.items && c.items.length > 0
        );

        setMenu(valid);
        await saveMenu(freshMenu);

        toast.success("Menu loaded successfully", {
          duration: 2000,
        });
      } catch {
        if (!cachedMenu?.length) {
          toast.error("Offline: No menu available", {
            description: "Please check your connection",
          });
        } else {
          toast.warning("Using cached menu", {
            description: "Unable to fetch latest updates",
          });
        }
      }
    } finally {
      if (!silent) setTimeout(() => setIsLoading(false), 500);
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