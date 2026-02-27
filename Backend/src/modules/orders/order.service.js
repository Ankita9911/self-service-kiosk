import Order from "./order.model.js";
import AppError from "../../shared/errors/AppError.js";
import { getIO } from "../../realtime/realtime.manager.js";
import { enqueue } from "../../core/queue/queue.producer.js";

export const VALID_STATUS_TRANSITIONS = {
  CREATED: ["IN_KITCHEN"],
  IN_KITCHEN: ["READY"],
  READY: ["PICKED_UP", "COMPLETED"],
  COMPLETED: ["PICKED_UP"],
  PICKED_UP: [],
};


export async function createOrder(data, tenant, userRole) {
  const { items, paymentMethod, clientOrderId } = data;

  if (!items || items.length === 0) {
    throw new AppError("Order items required", 400, "INVALID_ORDER");
  }

  if (!clientOrderId) {
    throw new AppError("clientOrderId is required", 400, "INVALID_ORDER");
  }

  await enqueue("ORDER_PLACED", {
    items,
    paymentMethod,
    clientOrderId,
    tenant,
    userRole,
  });

  return { clientOrderId, queued: true };
}

export async function listOrders(tenant, statuses) {
  if (!tenant.outletId) {
    throw new AppError("Outlet context required", 403, "OUTLET_REQUIRED");
  }

  const filter = { outletId: tenant.outletId };

  if (statuses && statuses.length > 0) {
    filter.status = { $in: statuses };
  }

  return Order.find(filter).sort({ createdAt: -1 }).lean();
}

export async function updateOrderStatus(orderId, newStatus, tenant) {
  if (!tenant.outletId) {
    throw new AppError("Outlet context required", 403, "OUTLET_REQUIRED");
  }

  const order = await Order.findOne({
    _id: orderId,
    outletId: tenant.outletId,
  });

  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }

  const allowed = VALID_STATUS_TRANSITIONS[order.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot transition from ${order.status} to ${newStatus}`,
      400,
      "INVALID_STATUS_TRANSITION",
    );
  }

  order.status = newStatus;
  await order.save();

  try {
    const io = getIO();
    io.to(`outlet:${order.outletId}`).emit("order:statusUpdated", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      order,
    });
  } catch (_) {}

  return order;
}
