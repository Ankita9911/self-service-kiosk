import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { getSQSClient } from "./sqs.client.js";
import env from "../../config/env.js";

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
    }),
  );
}
