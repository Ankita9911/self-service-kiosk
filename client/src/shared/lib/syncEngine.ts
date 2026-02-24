import axios from "axios";
import { getPendingOrders, markOrderSynced } from "./orderQueue";

export async function processQueue() {
  const pending = await getPendingOrders();

  for (const order of pending) {
    try {
      await axios.post("/orders", order.payload);
      await markOrderSynced(order.clientOrderId);
    } catch (error: any) {
      if (!error.response) {
        // Still offline → stop processing
        break;
      }
    }
  }
}
