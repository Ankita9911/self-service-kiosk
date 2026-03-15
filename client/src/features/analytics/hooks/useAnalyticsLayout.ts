import { useState, useEffect } from "react";

export type LayoutItem = {
  id: string;
  visible: boolean;
  order: number;
};

const STORAGE_KEY = "analytics_layout";

function defaultLayout(ids: string[]): LayoutItem[] {
  return ids.map((id, index) => ({ id, visible: true, order: index }));
}

export function useAnalyticsLayout(widgetIds: string[]) {
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: LayoutItem[] = JSON.parse(stored);
        // Merge: add any new widgets not in stored, remove obsolete ones
        const merged = widgetIds.map((id, index) => {
          const existing = parsed.find((p) => p.id === id);
          return existing || { id, visible: true, order: index };
        });
        return merged.sort((a, b) => a.order - b.order);
      }
    } catch (_) {
      // corrupted storage — use defaults
    }
    return defaultLayout(widgetIds);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  const toggleVisibility = (id: string) => {
    setLayout((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item,
      ),
    );
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    setLayout((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((item) => item.id === id);
      if (idx === -1) return prev;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= sorted.length) return prev;

      const newLayout = sorted.map((item, i) => {
        if (i === idx) return { ...item, order: sorted[target].order };
        if (i === target) return { ...item, order: sorted[idx].order };
        return item;
      });
      return newLayout;
    });
  };

  const resetLayout = () => setLayout(defaultLayout(widgetIds));

  const orderedVisibleIds = [...layout]
    .sort((a, b) => a.order - b.order)
    .filter((item) => item.visible)
    .map((item) => item.id);

  return { layout, orderedVisibleIds, toggleVisibility, moveItem, resetLayout };
}
