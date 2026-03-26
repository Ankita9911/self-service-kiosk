import { z } from "zod";
import {
  TELEMETRY_MAX_BATCH_SIZE,
  TELEMETRY_SCHEMA_VERSION,
} from "../constant/telemetry.constants.js";

const telemetryEventSchema = z.object({
  eventId: z.string().uuid("Invalid eventId"),
  schemaVersion: z
    .literal(TELEMETRY_SCHEMA_VERSION)
    .optional()
    .default(TELEMETRY_SCHEMA_VERSION),
  name: z
    .string({ required_error: "name is required" })
    .trim()
    .min(1)
    .max(120),
  ts: z
    .number({ required_error: "ts is required" })
    .int("ts must be an integer")
    .nonnegative("ts must be a positive timestamp"),
  seq: z
    .number({ required_error: "seq is required" })
    .int("seq must be an integer")
    .nonnegative("seq must be zero or greater"),
  page: z
    .string({ required_error: "page is required" })
    .trim()
    .min(1)
    .max(80),
  component: z
    .string({ required_error: "component is required" })
    .trim()
    .min(1)
    .max(80),
  action: z
    .string({ required_error: "action is required" })
    .trim()
    .min(1)
    .max(80),
  target: z.string().trim().max(160).nullable().optional().default(null),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
});

export const createTelemetryBatchSchema = z.object({
  visitorSessionId: z.string().uuid("Invalid visitorSessionId"),
  appVersion: z.string().trim().max(64).optional(),
  events: z
    .array(telemetryEventSchema)
    .min(1, "events are required")
    .max(
      TELEMETRY_MAX_BATCH_SIZE,
      `Maximum batch size is ${TELEMETRY_MAX_BATCH_SIZE}`,
    ),
});

