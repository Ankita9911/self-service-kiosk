import mongoose from "mongoose";
import Order from "../../../modules/orders/order.model.js";
import Counter from "../../../modules/orders/counter.model.js";
import OrderRequest from "../../../modules/orders/orderRequest.model.js";
import MenuItem from "../../../modules/menu/menuItem.model.js";
import Ingredient from "../../../modules/ingredients/ingredient.model.js";
import Recipe from "../../../modules/recipes/recipe.model.js";
import StockTransaction from "../../../modules/stockTransactions/stockTransaction.model.js";
import { enqueue } from "../queue.producer.js";
import { getRedisClient } from "../../cache/redis.client.js";
import { buildTenantKey } from "../../cache/cache.utils.js";
import { getIO } from "../../../realtime/realtime.manager.js";

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

    // ── Ingredient-level inventory deduction ────────────────────────────────
    // For each ordered item, look up its recipe and deduct ingredient stock.
    // Items without a configured recipe fall back to the existing MenuItem.stockQuantity path.
    const ingredientDeductions = []; // { ingredientId, name, quantity, franchiseId, outletId }

    for (const item of processedItems) {
      const recipe = await Recipe.findOne({
        menuItemId: item.itemId,
        franchiseId: tenant.franchiseId,
        outletId: tenant.outletId,
        isDeleted: false,
      }).session(session);

      if (!recipe) continue; // no recipe configured — MenuItem.stockQuantity already deducted above

      for (const recipeIngredient of recipe.ingredients) {
        const totalDeduction = recipeIngredient.quantity * item.quantity;

        const ingredient = await Ingredient.findOneAndUpdate(
          {
            _id: recipeIngredient.ingredientId,
            franchiseId: tenant.franchiseId,
            outletId: tenant.outletId,
            isDeleted: false,
            currentStock: { $gte: totalDeduction },
          },
          { $inc: { currentStock: -totalDeduction } },
          { returnDocument: "after", session }
        );

        if (!ingredient) {
          throw new Error(
            `Insufficient ingredient stock: ${recipeIngredient.ingredientId}`
          );
        }

        ingredientDeductions.push({
          ingredientId: ingredient._id,
          ingredientName: ingredient.name,
          currentStockAfter: ingredient.currentStock,
          minThreshold: ingredient.minThreshold,
          deductedQty: totalDeduction,
        });
      }
    }

    // Bulk-log CONSUMPTION transactions within the same Mongo session
    if (ingredientDeductions.length > 0) {
      const txDocs = ingredientDeductions.map((d) => ({
        ingredientId: d.ingredientId,
        type: "CONSUMPTION",
        quantity: -d.deductedQty, // stored as negative delta
        referenceType: "ORDER",
        referenceId: order[0]._id,
        note: `Order #${resolvedOrderNumber}`,
        franchiseId: tenant.franchiseId,
        outletId: tenant.outletId,
      }));
      await StockTransaction.insertMany(txDocs, { session });
    }
    // ────────────────────────────────────────────────────────────────────────

    await session.commitTransaction();
    session.endSession();

    // Post-commit: invalidate ingredient Redis cache
    if (ingredientDeductions.length > 0) {
      try {
        const redis = getRedisClient();
        const cacheKey = buildTenantKey("ingredients", tenant);
        await redis.del(cacheKey);
      } catch (_) {
        // non-fatal
      }

      // Enqueue low-stock alerts for any ingredient that dropped below threshold
      for (const d of ingredientDeductions) {
        if (d.currentStockAfter < d.minThreshold) {
          await enqueue("LOW_STOCK_ALERT", {
            ingredientId: String(d.ingredientId),
            ingredientName: d.ingredientName,
            currentStock: d.currentStockAfter,
            minThreshold: d.minThreshold,
            franchiseId: String(tenant.franchiseId),
            outletId: String(tenant.outletId),
          }).catch((err) =>
            console.error("[queue] Failed to enqueue LOW_STOCK_ALERT:", err.message)
          );
        }
      }
    }

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
