import mongoose from "mongoose";
import Order from "../../../modules/orders/model/order.model.js";
import Counter from "../../../modules/orders/model/counter.model.js";
import OrderRequest from "../../../modules/orders/model/orderRequest.model.js";
import MenuItem from "../../../modules/menu/model/menuItem.model.js";
import Ingredient from "../../../modules/ingredients/model/ingredient.model.js";
import Recipe from "../../../modules/recipes/model/recipe.model.js";
import StockTransaction from "../../../modules/stockTransactions/model/stockTransaction.model.js";
import {
  TRANSACTION_TYPE,
  REFERENCE_TYPE,
} from "../../../modules/stockTransactions/constant/stockTransaction.constants.js";
import { ANALYTICS_EVENT_TYPE } from "../../../modules/analytics/constant/analytics.constants.js";
import { enqueue } from "../queue.producer.js";
import { getRedisClient } from "../../cache/redis.client.js";
import { buildTenantKey } from "../../cache/cache.utils.js";
import { emitOutletEvent, getIO } from "../../../realtime/realtime.manager.js";

async function getNextOrderNumber(outletId, session) {
  const counter = await Counter.findOneAndUpdate(
    { outletId },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true, session },
  );
  return counter.seq;
}

function emitToOutlet(outletId, event, data) {
  try {
    const io = getIO();
    io.to(`outlet:${outletId}`).emit(event, data);
  } catch {
    // non-fatal
  }
}

async function resolveMenuItemStock(
  itemId,
  quantity,
  tenant,
  session,
  recipeTargets,
) {
  const menuItemBase = await MenuItem.findOne({
    _id: itemId,
    outletId: tenant.outletId,
    franchiseId: tenant.franchiseId,
    isDeleted: false,
    isActive: true,
  }).session(session);

  if (!menuItemBase) {
    throw new Error(`Invalid item: ${itemId}`);
  }

  const inventoryMode = menuItemBase.inventoryMode ?? "RECIPE";

  if (inventoryMode === "DIRECT") {
    const updated = await MenuItem.findOneAndUpdate(
      {
        _id: itemId,
        outletId: tenant.outletId,
        franchiseId: tenant.franchiseId,
        isDeleted: false,
        isActive: true,
        stockQuantity: { $gte: quantity },
      },
      { $inc: { stockQuantity: -quantity } },
      { returnDocument: "after", session },
    );

    if (!updated) {
      throw new Error(`Insufficient stock or invalid item: ${itemId}`);
    }

    return updated;
  }

  const recipe = await Recipe.findOne({
    menuItemId: itemId,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  }).session(session);

  if (!recipe) {
    throw new Error(`Recipe not configured for item: ${itemId}`);
  }

  recipeTargets.push({ itemId: menuItemBase._id, quantity });

  return menuItemBase;
}

async function resolveCustomizations(
  item,
  menuItem,
  tenant,
  session,
  recipeTargets,
) {
  const requestedIds = [
    ...new Set((item.customizationItemIds || []).map(String)),
  ];
  const allowedIds = new Set((menuItem.customizationItemIds || []).map(String));

  const selectedCustomizations = [];
  let customizationUnitTotal = 0;

  for (const customizationItemId of requestedIds) {
    if (!allowedIds.has(customizationItemId)) {
      throw new Error(
        `Invalid customization ${customizationItemId} for item: ${item.itemId}`,
      );
    }

    const customizationBase = await MenuItem.findOne({
      _id: customizationItemId,
      outletId: tenant.outletId,
      franchiseId: tenant.franchiseId,
      isDeleted: false,
    }).session(session);

    if (!customizationBase) {
      throw new Error(`Invalid customization item: ${customizationItemId}`);
    }

    const customizationMode = customizationBase.inventoryMode ?? "RECIPE";
    let customizationItem = customizationBase;

    if (customizationMode === "DIRECT") {
      customizationItem = await MenuItem.findOneAndUpdate(
        {
          _id: customizationItemId,
          outletId: tenant.outletId,
          franchiseId: tenant.franchiseId,
          isDeleted: false,
          stockQuantity: { $gte: item.quantity },
        },
        { $inc: { stockQuantity: -item.quantity } },
        { returnDocument: "after", session },
      );

      if (!customizationItem) {
        throw new Error(
          `Insufficient stock or invalid customization item: ${customizationItemId}`,
        );
      }
    } else {
      const customizationRecipe = await Recipe.findOne({
        menuItemId: customizationItemId,
        franchiseId: tenant.franchiseId,
        outletId: tenant.outletId,
        isDeleted: false,
      }).session(session);

      if (!customizationRecipe) {
        throw new Error(
          `Recipe not configured for customization item: ${customizationItemId}`,
        );
      }

      recipeTargets.push({
        itemId: customizationBase._id,
        quantity: item.quantity,
      });
    }

    customizationUnitTotal += customizationItem.price;

    selectedCustomizations.push({
      itemId: customizationItem._id,
      nameSnapshot: customizationItem.name,
      priceSnapshot: customizationItem.price,
      quantity: item.quantity,
      lineTotal: customizationItem.price * item.quantity,
    });
  }

  return { selectedCustomizations, customizationUnitTotal };
}

async function processOrderItems(items, tenant, session) {
  const processedItems = [];
  const recipeTargets = [];
  let totalAmount = 0;

  for (const item of items) {
    const menuItem = await resolveMenuItemStock(
      item.itemId,
      item.quantity,
      tenant,
      session,
      recipeTargets,
    );

    const { selectedCustomizations, customizationUnitTotal } =
      await resolveCustomizations(
        item,
        menuItem,
        tenant,
        session,
        recipeTargets,
      );

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

  return { processedItems, recipeTargets, totalAmount };
}

async function deductIngredients(
  recipeTargets,
  orderId,
  orderNumber,
  tenant,
  session,
) {
  const ingredientDeductions = [];

  for (const target of recipeTargets) {
    const recipe = await Recipe.findOne({
      menuItemId: target.itemId,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    }).session(session);

    if (!recipe) continue;

    for (const recipeIngredient of recipe.ingredients) {
      const totalDeduction = recipeIngredient.quantity * target.quantity;

      const ingredient = await Ingredient.findOneAndUpdate(
        {
          _id: recipeIngredient.ingredientId,
          franchiseId: tenant.franchiseId,
          outletId: tenant.outletId,
          isDeleted: false,
          currentStock: { $gte: totalDeduction },
        },
        { $inc: { currentStock: -totalDeduction } },
        { returnDocument: "after", session },
      );

      if (!ingredient) {
        throw new Error(
          `Insufficient ingredient stock: ${recipeIngredient.ingredientId}`,
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

  if (ingredientDeductions.length > 0) {
    const txDocs = ingredientDeductions.map((d) => ({
      ingredientId: d.ingredientId,
      type: TRANSACTION_TYPE.CONSUMPTION,
      quantity: -d.deductedQty,
      referenceType: REFERENCE_TYPE.ORDER,
      referenceId: orderId,
      note: `Order #${orderNumber}`,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
    }));
    await StockTransaction.insertMany(txDocs, { session });
  }

  return ingredientDeductions;
}

async function postCommitSideEffects(ingredientDeductions, order, tenant) {
  if (ingredientDeductions.length === 0) return;

  try {
    const redis = getRedisClient();
    await redis.del(buildTenantKey("ingredients", tenant));
  } catch {
    // non-fatal
  }

  const notifiedIngredientIds = new Set();

  for (const d of ingredientDeductions) {
    const ingredientId = String(d.ingredientId);
    if (notifiedIngredientIds.has(ingredientId)) continue;

    if (d.currentStockAfter < d.minThreshold && d.minThreshold > 0) {
      notifiedIngredientIds.add(ingredientId);

      await enqueue("LOW_STOCK_ALERT", {
        ingredientId,
        ingredientName: d.ingredientName,
        currentStock: d.currentStockAfter,
        minThreshold: d.minThreshold,
        franchiseId: String(tenant.franchiseId),
        outletId: String(tenant.outletId),
      }).catch((err) =>
        console.error(
          "[queue] Failed to enqueue LOW_STOCK_ALERT:",
          err.message,
        ),
      );
    }
  }

  emitOutletEvent(tenant.outletId, "inventory:updated", {
    type: "ORDER_CONSUMPTION",
    orderId: String(order._id),
  });
  emitOutletEvent(tenant.outletId, "stock-transactions:updated", {
    type: "ORDER_CONSUMPTION",
    orderId: String(order._id),
  });
}

export async function handleOrderPlaced(payload) {
  const { items, paymentMethod, clientOrderId, orderNumber, tenant, userRole } =
    payload;

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
        },
      );
      emitToOutlet(tenant.outletId, "order:new", existing);
      return existing;
    }

    const { processedItems, recipeTargets, totalAmount } =
      await processOrderItems(items, tenant, session);

    const resolvedOrderNumber =
      orderNumber ?? (await getNextOrderNumber(tenant.outletId, session));

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
      { session },
    );

    const ingredientDeductions = await deductIngredients(
      recipeTargets,
      order[0]._id,
      resolvedOrderNumber,
      tenant,
      session,
    );

    await session.commitTransaction();
    session.endSession();

    await postCommitSideEffects(ingredientDeductions, order[0], tenant);

    await OrderRequest.findOneAndUpdate(
      { outletId: tenant.outletId, clientOrderId },
      {
        $set: {
          status: "SUCCESS",
          orderId: order[0]._id,
          orderNumber: order[0].orderNumber,
          errorMessage: null,
        },
      },
    );

    emitToOutlet(tenant.outletId, "order:new", order[0]);
    emitToOutlet(tenant.outletId, "menu:updated", {
      type: "ORDER_STOCK_CHANGED",
      outletId: tenant.outletId,
    });

    await enqueue(ANALYTICS_EVENT_TYPE.ORDER_PLACED, {
      franchiseId: String(tenant.franchiseId),
      outletId: String(tenant.outletId),
      createdAt: order[0].createdAt,
      totalAmount: order[0].totalAmount,
      status: order[0].status,
      items: order[0].items,
    }).catch((err) =>
      console.error(
        "[queue] Failed to enqueue ANALYTICS_ORDER_PLACED:",
        err.message,
      ),
    );

    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
