import mongoose from "mongoose";
import Order from "../../../modules/orders/order.model.js";
import Counter from "../../../modules/orders/counter.model.js";
import MenuItem from "../../../modules/menu/menuItem.model.js"
import { getIO} from "../../../realtime/realtime.manager.js";

async function getNextOrderNumber(outletId, session) {
  const counter = await Counter.findOneAndUpdate(
    { outletId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );
  return counter.seq;
}

function emitToOutlet(outletId, event, data) {
  try {
    const io = getIO();
    io.to(`outlet:${outletId}`).emit(event, data);
  } catch (_) {
    console.log("Socket not initialized, skipping emit");
  }
}

/**
 * Handles ORDER_PLACED messages from the SQS queue.
 * Performs idempotency check, stock deduction, and order creation in a transaction.
 */
export async function handleOrderPlaced(payload) {
  const { items, paymentMethod, clientOrderId, orderNumber, tenant, userRole } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Idempotency: return silently if order already exists
    const existing = await Order.findOne({
      outletId: tenant.outletId,
      clientOrderId,
    }).session(session);

    if (existing) {
      await session.commitTransaction();
      session.endSession();
      emitToOutlet(tenant.outletId, "order:new", existing);
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
        throw new Error(
          `Insufficient stock or invalid item: ${item.itemId}`
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

    // Use the pre-assigned orderNumber from the HTTP layer (already incremented the counter)
    const resolvedOrderNumber = orderNumber ?? await getNextOrderNumber(tenant.outletId, session);

    const order = await Order.create(
      [
        {
          franchiseId: tenant.franchiseId,
          outletId: tenant.outletId,
          orderNumber: resolvedOrderNumber,
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

    emitToOutlet(tenant.outletId, "order:new", order[0]);

    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
