import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { getSQSClient } from "./sqs.client.js";
import env from "../../config/env.js";
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
          WaitTimeSeconds: 20,         // long polling — reduces empty receives
          MessageAttributeNames: ["All"],
        })
      );

      const messages = response.Messages || [];

      if (messages.length > 0) {
        // Process in parallel; failures don't remove the message (retry via visibility timeout)
        await Promise.allSettled(
          messages.map((msg) => processMessage(client, msg))
        );
      }
    } catch (err) {
      console.error("[queue] Poll error:", err.message);
      await sleep(5000); // back off before retrying
    }
  }

  console.log("[queue] SQS worker stopped");
}

async function processMessage(client, message) {
  let type;
  try {
    const body = JSON.parse(message.Body);
    type = body.type;
    const payload = body.payload;

    const handler = MESSAGE_HANDLERS[type];

    if (!handler) {
      console.warn(`[queue] No handler registered for type: ${type} — discarding`);
    } else {
      await handler(payload);
      console.log(`[queue] Processed: ${type} (${message.MessageId})`);
    }

    // Delete from queue after successful processing (or unknown type)
    await client.send(
      new DeleteMessageCommand({
        QueueUrl: env.SQS_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      })
    );
  } catch (err) {
    console.error(
      `[queue] Failed to process ${type || "unknown"} (${message.MessageId}):`,
      err.message
    );
    // Do NOT delete — message becomes visible again after visibility timeout
    // Configure a DLQ on the SQS queue for messages that repeatedly fail
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
