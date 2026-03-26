import { useEffect, useRef, useState } from "react";
import { trackApiTiming, trackEvent } from "@/features/kiosk/telemetry";
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
const EMPTY_MEAL: CompleteMealResult = { suggestions: [], comboDeal: null };

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
  menu: MenuCategory[],
): UseRecommendationsReturn {
  // ── Trending ──────────────────────────────────────────────────────────────
  const [trending, setTrending] = useState<RecommendedItem[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const requestStartedAt = performance.now();

    fetchTrending({ windowHours: 4, limit: 8 })
      .then((data) => {
        trackApiTiming({
          name: "kiosk.recommendation_fetch_timed",
          apiName: "recommendations/trending",
          durationMs: performance.now() - requestStartedAt,
          success: true,
          page: "menu",
          component: "recommendations",
          target: "trending",
          payload: {
            resultCount: data.length,
          },
        });
        trackEvent({
          name: "kiosk.recommendation_fetch_completed",
          page: "menu",
          component: "recommendations",
          action: "fetch_complete",
          target: "trending",
          payload: {
            resultCount: data.length,
          },
        });
        if (!cancelled) setTrending(data);
      })
      .catch(() => {
        trackApiTiming({
          name: "kiosk.recommendation_fetch_timed",
          apiName: "recommendations/trending",
          durationMs: performance.now() - requestStartedAt,
          success: false,
          page: "menu",
          component: "recommendations",
          target: "trending",
        });
        if (!cancelled) setTrending([]);
      })
      .finally(() => {
        if (!cancelled) setIsTrendingLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Frequently Bought Together ────────────────────────────────────────────
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState<
    RecommendedItem[]
  >([]);
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
      window.setTimeout(() => {
        setFrequentlyBoughtTogether([]);
        setIsFbtLoading(false);
      }, 0);
      return;
    }

    // Debounce to avoid firing on every single cart update
    if (fbtTimerRef.current) clearTimeout(fbtTimerRef.current);

    fbtTimerRef.current = setTimeout(() => {
      let cancelled = false;
      setIsFbtLoading(true);
      const requestStartedAt = performance.now();

      fetchFrequentlyBoughtTogether(itemIds, { limit: 5 })
        .then((data) => {
          trackApiTiming({
            name: "kiosk.recommendation_fetch_timed",
            apiName: "recommendations/frequently-bought-together",
            durationMs: performance.now() - requestStartedAt,
            success: true,
            page: "menu",
            component: "recommendations",
            target: "frequently_bought_together",
            payload: {
              resultCount: data.length,
              cartItemCount: itemIds.length,
            },
          });
          if (!cancelled) setFrequentlyBoughtTogether(data);
        })
        .catch(() => {
          trackApiTiming({
            name: "kiosk.recommendation_fetch_timed",
            apiName: "recommendations/frequently-bought-together",
            durationMs: performance.now() - requestStartedAt,
            success: false,
            page: "menu",
            component: "recommendations",
            target: "frequently_bought_together",
            payload: {
              cartItemCount: itemIds.length,
            },
          });
          if (!cancelled) setFrequentlyBoughtTogether([]);
        })
        .finally(() => {
          if (!cancelled) setIsFbtLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, FBT_DEBOUNCE_MS);

    return () => {
      if (fbtTimerRef.current) clearTimeout(fbtTimerRef.current);
    };
  }, [cart]);

  // ── Complete Meal ─────────────────────────────────────────────────────────
  const [completeMeal, setCompleteMeal] =
    useState<CompleteMealResult>(EMPTY_MEAL);
  const [isMealLoading, setIsMealLoading] = useState(false);

  const prevMealKeyRef = useRef<string>("");

  useEffect(() => {
    const itemIds = getCartItemIds(cart);
    const categoryIds = getCartCategoryIds(cart, menu);
    const key = `${[...itemIds].sort().join(",")}|${[...categoryIds].sort().join(",")}`;

    if (key === prevMealKeyRef.current) return;
    prevMealKeyRef.current = key;

    if (!itemIds.length) {
      window.setTimeout(() => {
        setCompleteMeal(EMPTY_MEAL);
        setIsMealLoading(false);
      }, 0);
      return;
    }

    let cancelled = false;
    const loadingTimer = window.setTimeout(() => {
      if (!cancelled) setIsMealLoading(true);
    }, 0);
    const requestStartedAt = performance.now();

    fetchCompleteMeal(itemIds, categoryIds, { limit: 4 })
      .then((data) => {
        trackApiTiming({
          name: "kiosk.recommendation_fetch_timed",
          apiName: "recommendations/complete-meal",
          durationMs: performance.now() - requestStartedAt,
          success: true,
          page: "menu",
          component: "recommendations",
          target: "complete_meal",
          payload: {
            suggestionCount: data.suggestions.length,
            hasComboDeal: Boolean(data.comboDeal),
            cartItemCount: itemIds.length,
            cartCategoryCount: categoryIds.length,
          },
        });
        if (!cancelled) setCompleteMeal(data);
      })
      .catch(() => {
        trackApiTiming({
          name: "kiosk.recommendation_fetch_timed",
          apiName: "recommendations/complete-meal",
          durationMs: performance.now() - requestStartedAt,
          success: false,
          page: "menu",
          component: "recommendations",
          target: "complete_meal",
          payload: {
            cartItemCount: itemIds.length,
            cartCategoryCount: categoryIds.length,
          },
        });
        if (!cancelled) setCompleteMeal(EMPTY_MEAL);
      })
      .finally(() => {
        if (!cancelled) setIsMealLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [cart, menu]);

  return {
    trending,
    isTrendingLoading,
    frequentlyBoughtTogether,
    isFbtLoading,
    completeMeal,
    isMealLoading,
  };
}
