import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { getSQSClient } from "./sqs.client.js";
import { MESSAGE_HANDLERS } from "./message.registry.js";
import env from "../../config/env.js";
import { getIO } from "../../realtime/realtime.manager.js";
import OrderRequest from "../../modules/orders/orderRequest.model.js";

const TERMINAL_ORDER_ERROR_PREFIXES = [
  "Insufficient stock or invalid item:",
  "Insufficient stock or invalid customization item:",
  "Invalid customization",
  "Insufficient ingredient stock:",
];

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

    await deleteMessage(client, message.ReceiptHandle);
  } catch (err) {
    if (isTerminalOrderError(type, err)) {
      await markOrderRequestFailed(payload, err.message);
      emitOrderFailed(payload, err.message);
      await deleteMessage(client, message.ReceiptHandle);
    }

    console.error(
      `[queue] Failed to process ${type || "unknown"} (${message.MessageId}):`,
      err.message
    );
  }
}

//Helpers

function isTerminalOrderError(type, err) {
  if (type !== "ORDER_PLACED") return false;
  if (typeof err?.message !== "string") return false;
  return TERMINAL_ORDER_ERROR_PREFIXES.some((prefix) => err.message.startsWith(prefix));
}

async function deleteMessage(client, receiptHandle) {
  await client.send(
    new DeleteMessageCommand({
      QueueUrl: env.SQS_QUEUE_URL,
      ReceiptHandle: receiptHandle,
    })
  );
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
  } catch (err) {
    console.error("[queue] Failed to update order request status:", err.message);
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
  } catch {
    // Socket not yet initialised — non-fatal
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
