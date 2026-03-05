import mongoose from "mongoose";
import Order from "../../../modules/orders/order.model.js";
import Counter from "../../../modules/orders/counter.model.js";
import OrderRequest from "../../../modules/orders/orderRequest.model.js";
import MenuItem from "../../../modules/menu/menuItem.model.js";
import { getIO} from "../../../realtime/realtime.manager.js";

async function getNextOrderNumber(outletId, session) {
  const counter = await Counter.findOneAndUpdate(
    { outletId },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true, session }
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

export async function handleOrderPlaced(payload) {
  const { items, paymentMethod, clientOrderId, orderNumber, tenant, userRole } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existing = await Order.findOne({
      outletId: tenant.outletId,
      clientOrderId,
    }).session(session);

    if (existing) {
      await session.commitTransaction();
      session.endSession();

      await OrderRequest.findOneAndUpdate(
        { outletId: tenant.outletId, clientOrderId },
        {
          $set: {
            status: "SUCCESS",
            orderId: existing._id,
            orderNumber: existing.orderNumber,
            errorMessage: null,
          },
        }
      );

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
        { returnDocument: "after", session }
      );

      if (!menuItem) {
        throw new Error(
          `Insufficient stock or invalid item: ${item.itemId}`
        );
      }

      const requestedCustomizationIds = [
        ...new Set((item.customizationItemIds || []).map((id) => String(id))),
      ];
      const allowedCustomizationIds = new Set(
        (menuItem.customizationItemIds || []).map((id) => String(id))
      );

      const selectedCustomizations = [];
      let customizationUnitTotal = 0;

      for (const customizationItemId of requestedCustomizationIds) {
        if (!allowedCustomizationIds.has(customizationItemId)) {
          throw new Error(
            `Invalid customization ${customizationItemId} for item: ${item.itemId}`
          );
        }

        const customizationItem = await MenuItem.findOneAndUpdate(
          {
            _id: customizationItemId,
            outletId: tenant.outletId,
            franchiseId: tenant.franchiseId,
            isDeleted: false,
            stockQuantity: { $gte: item.quantity },
          },
          { $inc: { stockQuantity: -item.quantity } },
          { returnDocument: "after", session }
        );

        if (!customizationItem) {
          throw new Error(
            `Insufficient stock or invalid customization item: ${customizationItemId}`
          );
        }

        const customizationLineTotal = customizationItem.price * item.quantity;
        customizationUnitTotal += customizationItem.price;

        selectedCustomizations.push({
          itemId: customizationItem._id,
          nameSnapshot: customizationItem.name,
          priceSnapshot: customizationItem.price,
          quantity: item.quantity,
          lineTotal: customizationLineTotal,
        });
      }

      const unitPrice = menuItem.price + customizationUnitTotal;
      const lineTotal = unitPrice * item.quantity;
      totalAmount += lineTotal;

      processedItems.push({
        itemId: menuItem._id,
        nameSnapshot: menuItem.name,
        priceSnapshot: menuItem.price,
        quantity: item.quantity,
        lineTotal,
        customizations: selectedCustomizations,
      });
    }
   
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

    await OrderRequest.findOneAndUpdate(
      { outletId: tenant.outletId, clientOrderId },
      {
        $set: {
          status: "SUCCESS",
          orderId: order[0]._id,
          orderNumber: order[0].orderNumber,
          errorMessage: null,
        },
      }
    );

    emitToOutlet(tenant.outletId, "order:new", order[0]);
    emitToOutlet(tenant.outletId, "menu:updated", {
      type: "ORDER_STOCK_CHANGED",
      outletId: tenant.outletId,
    });

    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
