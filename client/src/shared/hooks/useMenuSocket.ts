import { useMemo } from "react";
import { useOutletEvents } from "@/shared/hooks/useOutletEvents";

/**
 * Listens for `menu:updated` socket events emitted by the queue worker.
 *
 * - Kiosk devices pass their device token explicitly via `auth` (device JWT
 *   is stored in the `kiosk_token` cookie).
 * - Authenticated admin/staff users rely on the httpOnly cookie
 *   (`withCredentials: true`) — no token in JS land.
 *
 * @param onRefresh  - callback to re-fetch menu data
 * @param outletId   - the outlet being viewed (required for admin users)
 */
export function useMenuSocket(onRefresh: () => void, outletId?: string) {
  const events = useMemo(
    () => ["menu:updated", "recipe:updated", "inventory:updated"],
    []
  );
  return useOutletEvents(events, onRefresh, outletId);
}
