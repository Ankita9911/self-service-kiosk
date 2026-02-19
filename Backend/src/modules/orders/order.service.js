import mongoose from "mongoose";
import Order from "./order.model.js";
import Counter from "./counter.model.js";
import MenuItem from "../menu/menuItem.model.js";
import AppError from "../../shared/errors/AppError.js";

async function getNextOrderNumber(outletId, session) {
  const counter = await Counter.findOneAndUpdate(
    { outletId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );

  return counter.seq;
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
        {
          $inc: { stockQuantity: -item.quantity },
        },
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

    const orderNumber = await getNextOrderNumber(
      tenant.outletId,
      session
    );

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

    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
