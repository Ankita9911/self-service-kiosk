import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { getSQSClient } from "./sqs.client.js";
import env from "../../config/env.js";
import { getIO } from "../../realtime/realtime.manager.js";
import OrderRequest from "../../modules/orders/orderRequest.model.js";
import { handleOrderPlaced } from "./handlers/order.handler.js";
import {
  handleMenuPriceUpdate,
  handleMenuStockUpdate,
  handleMenuCategoryCreate,
  handleMenuCategoryUpdate,
  handleMenuCategoryDelete,
  handleMenuItemCreate,
  handleMenuItemUpdate,
  handleMenuItemDelete,
  handleMenuItemStatusUpdate,
  handleComboCreate,
  handleComboUpdate,
  handleComboDelete,
} from "./handlers/menu.handler.js";

const MESSAGE_HANDLERS = {
  ORDER_PLACED: handleOrderPlaced,
  MENU_PRICE_UPDATE: handleMenuPriceUpdate,
  MENU_STOCK_UPDATE: handleMenuStockUpdate,
  MENU_CATEGORY_CREATE: handleMenuCategoryCreate,
  MENU_CATEGORY_UPDATE: handleMenuCategoryUpdate,
  MENU_CATEGORY_DELETE: handleMenuCategoryDelete,
  MENU_ITEM_CREATE: handleMenuItemCreate,
  MENU_ITEM_UPDATE: handleMenuItemUpdate,
  MENU_ITEM_DELETE: handleMenuItemDelete,
  MENU_ITEM_STATUS_UPDATE: handleMenuItemStatusUpdate,
  COMBO_CREATE: handleComboCreate,
  COMBO_UPDATE: handleComboUpdate,
  COMBO_DELETE: handleComboDelete,
};

let running = false;

export async function startWorker() {
  if (running) return;
  running = true;
  console.log("[queue] SQS worker started — polling", env.SQS_QUEUE_URL);
  poll();
}

export function stopWorker() {
  running = false;
}

async function poll() {
  const client = getSQSClient();

  while (running) {
    try {
      const response = await client.send(
        new ReceiveMessageCommand({
          QueueUrl: env.SQS_QUEUE_URL,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,         
          MessageAttributeNames: ["All"],
        })
      );

      const messages = response.Messages || [];

      if (messages.length > 0) {
        await Promise.allSettled(
          messages.map((msg) => processMessage(client, msg))
        );
      }
    } catch (err) {
      console.error("[queue] Poll error:", err.message);
      await sleep(5000); 
    }
  }

  console.log("[queue] SQS worker stopped");
}

async function processMessage(client, message) {
  let type;
  let payload;
  try {
    const body = JSON.parse(message.Body);
    type = body.type;
    payload = body.payload;

    const handler = MESSAGE_HANDLERS[type];

    if (!handler) {
      console.warn(`[queue] No handler registered for type: ${type} — discarding`);
    } else {
      await handler(payload);
      console.log(`[queue] Processed: ${type} (${message.MessageId})`);
    }

    await client.send(
      new DeleteMessageCommand({
        QueueUrl: env.SQS_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      })
    );
  } catch (err) {
    const terminalBusinessError =
      type === "ORDER_PLACED" &&
      typeof err?.message === "string" &&
      (
        err.message.startsWith("Insufficient stock or invalid item:") ||
        err.message.startsWith("Insufficient stock or invalid customization item:") ||
        err.message.startsWith("Invalid customization")
      );

    if (terminalBusinessError && payload?.tenant?.outletId && payload?.clientOrderId) {
      await markOrderRequestFailed(payload, err?.message);
      emitOrderFailed(payload, err?.message);
      await client.send(
        new DeleteMessageCommand({
          QueueUrl: env.SQS_QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle,
        })
      );
    }

    console.error(
      `[queue] Failed to process ${type || "unknown"} (${message.MessageId}):`,
      err.message
    );
  }
}

async function markOrderRequestFailed(payload, errorMessage) {
  try {
    await OrderRequest.findOneAndUpdate(
      { outletId: payload.tenant.outletId, clientOrderId: payload.clientOrderId },
      {
        $set: {
          status: "FAILED",
          errorMessage: errorMessage || "Order processing failed",
        },
      }
    );
  } catch (updateErr) {
    console.error("[queue] Failed to update order request status:", updateErr.message);
  }
}

function emitOrderFailed(payload, errorMessage) {
  try {
    const io = getIO();
    io.to(`outlet:${payload.tenant.outletId}`).emit("order:failed", {
      clientOrderId: payload.clientOrderId,
      orderNumber: payload.orderNumber,
      message: errorMessage || "Order processing failed",
    });
  } catch (_) {
    console.log("Socket not initialized, skipping failed-order emit");
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
