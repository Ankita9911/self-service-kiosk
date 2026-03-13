import { useEffect, useRef, useState, useCallback } from "react";
import type { CartItem } from "../types/cartItem.types";
import type { MenuCategory } from "../types/menu.types";
import {
  fetchTrending,
  fetchFrequentlyBoughtTogether,
  fetchCompleteMeal,
  type RecommendedItem,
  type CompleteMealResult,
} from "../services/recommendation.service";

const FBT_DEBOUNCE_MS = 600;

// ─── Derive unique itemIds and categoryIds from cart ─────────────────────────

function getCartItemIds(cart: CartItem[]): string[] {
  return [...new Set(cart.map((c) => c.itemId).filter(Boolean))];
}

function getCartCategoryIds(cart: CartItem[], menu: MenuCategory[]): string[] {
  const itemIdSet = new Set(cart.map((c) => c.itemId));
  const catIds = new Set<string>();

  for (const category of menu) {
    for (const item of category.items ?? []) {
      if (itemIdSet.has(String(item._id))) {
        catIds.add(String(category._id));
      }
    }
  }
  return [...catIds];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseRecommendationsReturn {
  trending: RecommendedItem[];
  isTrendingLoading: boolean;
  frequentlyBoughtTogether: RecommendedItem[];
  isFbtLoading: boolean;
  completeMeal: CompleteMealResult;
  isMealLoading: boolean;
}

export function useRecommendations(
  cart: CartItem[],
  menu: MenuCategory[]
): UseRecommendationsReturn {
  // ── Trending ──────────────────────────────────────────────────────────────
  const [trending, setTrending] = useState<RecommendedItem[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsTrendingLoading(true);

    fetchTrending({ windowHours: 4, limit: 8 })
      .then((data) => { if (!cancelled) setTrending(data); })
      .catch(() => { if (!cancelled) setTrending([]); })
      .finally(() => { if (!cancelled) setIsTrendingLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // ── Frequently Bought Together ────────────────────────────────────────────
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState<RecommendedItem[]>([]);
  const [isFbtLoading, setIsFbtLoading] = useState(false);

  const fbtTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevItemIdsRef = useRef<string>("");

  useEffect(() => {
    const itemIds = getCartItemIds(cart);
    const key = itemIds.slice().sort().join(",");

    // Skip if cart items haven't changed
    if (key === prevItemIdsRef.current) return;
    prevItemIdsRef.current = key;

    if (!itemIds.length) {
      setFrequentlyBoughtTogether([]);
      return;
    }

    // Debounce to avoid firing on every single cart update
    if (fbtTimerRef.current) clearTimeout(fbtTimerRef.current);

    fbtTimerRef.current = setTimeout(() => {
      let cancelled = false;
      setIsFbtLoading(true);

      fetchFrequentlyBoughtTogether(itemIds, { limit: 5 })
        .then((data) => { if (!cancelled) setFrequentlyBoughtTogether(data); })
        .catch(() => { if (!cancelled) setFrequentlyBoughtTogether([]); })
        .finally(() => { if (!cancelled) setIsFbtLoading(false); });

      return () => { cancelled = true; };
    }, FBT_DEBOUNCE_MS);

    return () => {
      if (fbtTimerRef.current) clearTimeout(fbtTimerRef.current);
    };
  }, [cart]);

  // ── Complete Meal ─────────────────────────────────────────────────────────
  const emptyMeal: CompleteMealResult = { suggestions: [], comboDeal: null };
  const [completeMeal, setCompleteMeal] = useState<CompleteMealResult>(emptyMeal);
  const [isMealLoading, setIsMealLoading] = useState(false);

  const prevMealKeyRef = useRef<string>("");

  const fetchMeal = useCallback(() => {
    const itemIds = getCartItemIds(cart);
    const categoryIds = getCartCategoryIds(cart, menu);
    const key = `${[...itemIds].sort().join(",")}|${[...categoryIds].sort().join(",")}`;

    if (key === prevMealKeyRef.current) return;
    prevMealKeyRef.current = key;

    if (!itemIds.length) {
      setCompleteMeal(emptyMeal);
      return;
    }

    let cancelled = false;
    setIsMealLoading(true);

    fetchCompleteMeal(itemIds, categoryIds, { limit: 4 })
      .then((data) => { if (!cancelled) setCompleteMeal(data); })
      .catch(() => { if (!cancelled) setCompleteMeal(emptyMeal); })
      .finally(() => { if (!cancelled) setIsMealLoading(false); });

    return () => { cancelled = true; };
  }, [cart, menu]);

  useEffect(() => {
    fetchMeal();
  }, [fetchMeal]);

  return {
    trending,
    isTrendingLoading,
    frequentlyBoughtTogether,
    isFbtLoading,
    completeMeal,
    isMealLoading,
  };
}
