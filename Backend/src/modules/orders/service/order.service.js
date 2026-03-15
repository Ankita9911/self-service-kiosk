import Order from "../model/order.model.js";
import Counter from "../model/counter.model.js";
import OrderRequest from "../orderRequest.model.js";
import AppError from "../../../shared/errors/AppError.js";
import { getIO } from "../../../realtime/realtime.manager.js";
import { enqueue } from "../../../core/queue/queue.producer.js";
import { VALID_STATUS_TRANSITIONS } from "../constant/order.constants.js";

export async function createOrder(data, tenant, userRole) {
  const { items, paymentMethod, clientOrderId } = data;

  if (!items || items.length === 0) {
    throw new AppError("Order items required", 400, "INVALID_ORDER");
  }

  if (!clientOrderId) {
    throw new AppError("clientOrderId is required", 400, "INVALID_ORDER");
  }

  const existingRequest = await OrderRequest.findOne({
    outletId: tenant.outletId,
    clientOrderId,
  }).lean();

  if (existingRequest) {
    return {
      clientOrderId,
      orderNumber: existingRequest.orderNumber,
      queued: existingRequest.status === "PENDING",
      status: existingRequest.status,
      errorMessage: existingRequest.errorMessage,
    };
  }

  // Pre-generate the order number so it can be returned immediately
  const counter = await Counter.findOneAndUpdate(
    { outletId: tenant.outletId },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true },
  );
  const orderNumber = counter.seq;

  await OrderRequest.create({
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    clientOrderId,
    orderNumber,
    status: "PENDING",
  });

  await enqueue("ORDER_PLACED", {
    items,
    paymentMethod,
    clientOrderId,
    orderNumber,
    tenant,
    userRole,
  });

  return { clientOrderId, orderNumber, queued: true };
}

export async function getOrderProcessingStatus(clientOrderId, tenant) {
  if (!tenant.outletId) {
    throw new AppError("Outlet context required", 403, "OUTLET_REQUIRED");
  }

  const request = await OrderRequest.findOne({
    outletId: tenant.outletId,
    clientOrderId,
  })
    .select("clientOrderId orderNumber status errorMessage orderId")
    .lean();

  if (!request) {
    return {
      clientOrderId,
      orderNumber: null,
      status: "UNKNOWN",
      errorMessage: null,
      orderId: null,
    };
  }

  return {
    clientOrderId: request.clientOrderId,
    orderNumber: request.orderNumber,
    status: request.status,
    errorMessage: request.errorMessage,
    orderId: request.orderId,
  };
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
  } catch {
    // Socket not initialised — non-fatal
  }

  return order;
}
