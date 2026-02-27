import { SQSClient } from "@aws-sdk/client-sqs";
import env from "../../config/env.js";

let sqsClient = null;

export function getSQSClient() {
  if (!sqsClient) {
    sqsClient = new SQSClient({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return sqsClient;
}
