import Order from "../../orders/model/order.model.js";
import {
  recordOrderPlacedAggregate,
  recordOrderStatusChangeAggregate,
  resetDailyAggregate,
  toAnalyticsDateKey,
} from "./analytics.aggregate.service.js";

function getDayBounds(inputDate) {
  const start = new Date(inputDate || Date.now());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function reconcileDailyAnalytics(inputDate) {
  const { start, end } = getDayBounds(inputDate);
  const dateKey = toAnalyticsDateKey(start);

  await resetDailyAggregate(dateKey);

  const orders = await Order.find({ createdAt: { $gte: start, $lt: end } })
    .select("franchiseId outletId createdAt totalAmount status items")
    .lean();

  for (const order of orders) {
    await recordOrderPlacedAggregate({
      franchiseId: String(order.franchiseId),
      outletId: String(order.outletId),
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      status: "CREATED",
      items: order.items,
    });

    if (order.status && order.status !== "CREATED") {
      await recordOrderStatusChangeAggregate({
        franchiseId: String(order.franchiseId),
        outletId: String(order.outletId),
        createdAt: order.createdAt,
        fromStatus: "CREATED",
        toStatus: order.status,
      });
    }
  }

  return {
    dateKey,
    rebuiltOrders: orders.length,
  };
}
