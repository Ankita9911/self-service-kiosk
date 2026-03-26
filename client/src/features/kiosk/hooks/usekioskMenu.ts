import { useEffect, useState, useCallback } from "react";
import kioskAxios from "@/shared/lib/kioskAxios";
import { trackApiTiming, trackEvent } from "@/features/kiosk/telemetry";
import type {
  MenuCategory,
  Combo,
  OfferType,
  MenuItem,
} from "../types/menu.types";
import { useMenuSocket } from "@/shared/hooks/useMenuSocket";

const ALL_CATEGORY_ID = "__ALL__";
export const COMBOS_CATEGORY_ID = "__COMBOS__";

function getOrderType(): "DINE_IN" | "TAKE_AWAY" | null {
  const t = localStorage.getItem("kiosk_order_type");
  if (t === "DINE_IN" || t === "TAKE_AWAY") return t;
  return null;
}

type ServiceTypeScoped = {
  serviceType?: MenuItem["serviceType"];
};

function filterByOrderType<T extends ServiceTypeScoped>(items: T[]): T[] {
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
  const [selectedCategory, setSelectedCategory] =
    useState<string>(ALL_CATEGORY_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [offerFilter, setOfferFilter] = useState<OfferType | null>(null);

  const loadMenu = useCallback(async (silent = false) => {
    const requestStartedAt = performance.now();

    try {
      if (!silent) setIsLoading(true);
      const [menuRes, combosRes] = await Promise.all([
        kioskAxios.get("/kiosk/menu"),
        kioskAxios.get("/kiosk/combos").catch(() => ({ data: { data: [] } })),
      ]);
      const freshMenu = (menuRes.data.data as MenuCategory[]).sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
      );
      const valid = freshMenu.filter((category) => category.items.length > 0);
      const fetchedCombos = (combosRes.data.data ?? []) as Combo[];
      setMenu(valid);
      setCombos(fetchedCombos);
      trackApiTiming({
        name: "kiosk.menu_api_timed",
        apiName: "kiosk/menu",
        durationMs: performance.now() - requestStartedAt,
        success: true,
        page: "menu",
        component: "menu_loader",
        payload: {
          silent,
          categoryCount: valid.length,
          comboCount: fetchedCombos.length,
        },
      });
      trackEvent({
        name: "kiosk.menu_loaded",
        page: "menu",
        component: "menu_loader",
        action: "load",
        payload: {
          silent,
          categoryCount: valid.length,
          itemCount: valid.reduce(
            (count: number, category: MenuCategory) =>
              count + (category.items?.length ?? 0),
            0,
          ),
          comboCount: fetchedCombos.length,
        },
      });
    } catch {
      trackApiTiming({
        name: "kiosk.menu_api_timed",
        apiName: "kiosk/menu",
        durationMs: performance.now() - requestStartedAt,
        success: false,
        page: "menu",
        component: "menu_loader",
        payload: {
          silent,
        },
      });
      trackEvent({
        name: "kiosk.menu_load_failed",
        page: "menu",
        component: "menu_loader",
        action: "load_failed",
        payload: {
          silent,
        },
      });
      // silently ignore menu load errors
    } finally {
      if (!silent) setTimeout(() => setIsLoading(false), 500);
      else setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  useMenuSocket(() => loadMenu(true));

  const filteredMenu: MenuCategory[] = menu
    .map((cat) => ({ ...cat, items: filterByOrderType(cat.items || []) }))
    .filter((cat) => cat.items.length > 0);

  const allItems = filterByOrderType(menu.flatMap((c) => c.items || []));

  function filterByOffer(items: MenuItem[]) {
    if (!offerFilter) return items;
    return items.filter((item) =>
      (item.offers ?? []).some((offer) => offer.type === offerFilter),
    );
  }

  const rawItems =
    selectedCategory === ALL_CATEGORY_ID
      ? allItems
      : filterByOrderType(
          menu.find((c) => c._id === selectedCategory)?.items || [],
        );

  const selectedItems = filterByOffer(rawItems);
  const visibleCombos = filterByOrderTypeCombo(combos);
  const hasActiveCombos = visibleCombos.length > 0;

  const categoriesWithAll: MenuCategory[] = [
    ...(hasActiveCombos
      ? [
          {
            _id: COMBOS_CATEGORY_ID,
            name: "Combos",
            items: visibleCombos as unknown as MenuItem[],
          } as MenuCategory,
        ]
      : []),
    { _id: ALL_CATEGORY_ID, name: "All", items: allItems } as MenuCategory,
    ...filteredMenu,
  ];

  const offerCounts: Record<OfferType, number> = {
    DISCOUNT: 0,
    BOGO: 0,
    NEW: 0,
    BESTSELLER: 0,
    LIMITED: 0,
  };
  allItems.forEach((item) => {
    (item.offers ?? []).forEach((offer) => {
      if (offer.type && offer.type in offerCounts) {
        offerCounts[offer.type as OfferType]++;
      }
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
