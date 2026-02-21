import mongoose from "mongoose";
import Order from "./order.model.js";
import Counter from "./counter.model.js";
import MenuItem from "../menu/menuItem.model.js";
import AppError from "../../shared/errors/AppError.js";
import { getIO } from "../../realtime/realtime.manager.js";

async function getNextOrderNumber(outletId, session) {
  const counter = await Counter.findOneAndUpdate(
    { outletId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );
  return counter.seq;
}

/**
 * Emit a socket event scoped to a specific outlet room.
 * Rooms are named: outlet:<outletId>
 */
function emitToOutlet(outletId, event, payload) {
  try {
    const io = getIO();
    io.to(`outlet:${outletId}`).emit(event, payload);
  } catch (_) {
    // Socket not initialised in test env — ignore
  }
}

export async function createOrder(data, tenant, userRole) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, paymentMethod, clientOrderId } = data;

    if (!items || items.length === 0) {
      throw new AppError("Order items required", 400, "INVALID_ORDER");
    }

    // Idempotency check
    const existing = await Order.findOne({
      outletId: tenant.outletId,
      clientOrderId,
    }).session(session);

    if (existing) {
      await session.commitTransaction();
      session.endSession();
      return existing;
    }

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findOneAndUpdate(
        {
          _id: item.itemId,
          outletId: tenant.outletId,
          franchiseId: tenant.franchiseId,
          isDeleted: false,
          isActive: true,
          stockQuantity: { $gte: item.quantity },
        },
        { $inc: { stockQuantity: -item.quantity } },
        { new: true, session }
      );

      if (!menuItem) {
        throw new AppError(
          "Insufficient stock or invalid item",
          400,
          "STOCK_ERROR"
        );
      }

      const lineTotal = menuItem.price * item.quantity;
      totalAmount += lineTotal;

      processedItems.push({
        itemId: menuItem._id,
        nameSnapshot: menuItem.name,
        priceSnapshot: menuItem.price,
        quantity: item.quantity,
        lineTotal,
      });
    }

    const orderNumber = await getNextOrderNumber(tenant.outletId, session);

    const order = await Order.create(
      [
        {
          franchiseId: tenant.franchiseId,
          outletId: tenant.outletId,
          orderNumber,
          clientOrderId,
          items: processedItems,
          totalAmount,
          paymentMethod,
          paymentStatus: "SUCCESS",
          createdByRole: userRole,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Notify kitchen screen of new order
    emitToOutlet(tenant.outletId, "order:new", order[0]);

    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

// CREATED → IN_KITCHEN → READY → PICKED_UP (terminal)
// COMPLETED kept for backwards compat but PICKED_UP is primary terminal
const VALID_STATUS_TRANSITIONS = {
  CREATED: ["IN_KITCHEN"],
  IN_KITCHEN: ["READY"],
  READY: ["PICKED_UP", "COMPLETED"],
  COMPLETED: ["PICKED_UP"],
  PICKED_UP: [],
};

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
      "INVALID_STATUS_TRANSITION"
    );
  }

  order.status = newStatus;
  await order.save();

  // Broadcast status change to all screens in this outlet
  emitToOutlet(order.outletId, "order:statusUpdated", {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    order,
  });

  return order;
}