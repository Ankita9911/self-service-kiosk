import { useEffect, useState, useCallback } from "react";
import kioskAxios from "@/shared/lib/kioskAxios";
import type { MenuCategory, Combo, OfferType } from "../types/menu.types";
import { useMenuSocket } from "@/shared/hooks/useMenuSocket";

const ALL_CATEGORY_ID = "__ALL__";
export const COMBOS_CATEGORY_ID = "__COMBOS__";

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

function filterByOrderTypeCombo(combos: Combo[]): Combo[] {
  const orderType = getOrderType();
  if (!orderType) return combos;
  return combos.filter((c) => {
    const st = c.serviceType ?? "BOTH";
    return st === "BOTH" || st === orderType;
  });
}

export function useKioskMenu() {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [offerFilter, setOfferFilter] = useState<OfferType | null>(null);

  const loadMenu = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [menuRes, combosRes] = await Promise.all([
        kioskAxios.get("/kiosk/menu"),
        kioskAxios.get("/kiosk/combos").catch(() => ({ data: { data: [] } })),
      ]);
      const freshMenu = menuRes.data.data.sort(
        (a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      );
      const valid = freshMenu.filter((c: any) => c.items && c.items.length > 0);
      setMenu(valid);
      setCombos(combosRes.data.data ?? []);
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

  const filteredMenu: MenuCategory[] = menu
    .map((cat) => ({ ...cat, items: filterByOrderType(cat.items || []) }))
    .filter((cat) => cat.items.length > 0);

  const allItems = filterByOrderType(menu.flatMap((c) => c.items || []));

  function filterByOffer(items: any[]) {
    if (!offerFilter) return items;
    return items.filter((item) =>
      (item.offers ?? []).some((o: any) => o.type === offerFilter)
    );
  }

  const rawItems =
    selectedCategory === ALL_CATEGORY_ID
      ? allItems
      : menu.find((c) => c._id === selectedCategory)?.items
          ? filterByOrderType(menu.find((c) => c._id === selectedCategory)!.items || [])
          : [];

  const selectedItems = filterByOffer(rawItems);

  const visibleCombos = filterByOrderTypeCombo(combos);
  const hasActiveCombos = visibleCombos.length > 0;

  const categoriesWithAll: MenuCategory[] = [
    ...(hasActiveCombos
      ? [{ _id: COMBOS_CATEGORY_ID, name: "Combos", items: [] } as MenuCategory]
      : []),
    {
      _id: ALL_CATEGORY_ID,
      name: "All",
      items: allItems,
    } as MenuCategory,
    ...filteredMenu,
  ];

  // Compute offer counts for filter strip
  const offerCounts: Record<OfferType, number> = {
    DISCOUNT: 0,
    BOGO: 0,
    NEW: 0,
    BESTSELLER: 0,
    LIMITED: 0,
  };
  allItems.forEach((item) => {
    (item.offers ?? []).forEach((o: any) => {
      if (o.type in offerCounts) offerCounts[o.type as OfferType]++;
    });
  });

  return {
    menu,
    combos: visibleCombos,
    selectedCategory,
    setSelectedCategory,
    selectedItems,
    categoriesWithAll,
    isLoading,
    loadMenu,
    offerFilter,
    setOfferFilter,
    offerCounts,
    COMBOS_CATEGORY_ID,
    ALL_CATEGORY_ID,
  };
}