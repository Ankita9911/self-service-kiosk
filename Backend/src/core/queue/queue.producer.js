import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { getSQSClient } from "./sqs.client.js";
import env from "../../config/env.js";

/**
 * Send a message to the SQS queue.
 * @param {string} type  - Message type (e.g. "ORDER_PLACED", "MENU_PRICE_UPDATE")
 * @param {object} payload - Arbitrary payload for the handler
 */
export async function enqueue(type, payload) {
  const client = getSQSClient();

  await client.send(
    new SendMessageCommand({
      QueueUrl: env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify({ type, payload }),
      MessageAttributes: {
        MessageType: {
          DataType: "String",
          StringValue: type,
        },
      },
    })
  );
}
