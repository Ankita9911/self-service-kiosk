import { useMemo } from "react";
import { useOutletEvents } from "@/shared/hooks/useOutletEvents";

export function useMenuSocket(onRefresh: () => void, outletId?: string) {
  const events = useMemo(
    () => ["menu:updated", "recipe:updated", "inventory:updated"],
    [],
  );
  return useOutletEvents(events, onRefresh, outletId);
}
