import kioskAxios from "@/shared/lib/kioskAxios";
import { getPendingOrders, markOrderSynced } from "./orderQueue";

export async function processQueue() {
  const pending = await getPendingOrders();

  for (const order of pending) {
    try {
      await kioskAxios.post("/orders", order.payload);
      await markOrderSynced(order.clientOrderId);
    } catch (error: unknown) {
      if (!(error as { response?: unknown }).response) {
        break;
      }
    }
  }
}
