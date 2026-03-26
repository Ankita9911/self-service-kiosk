import "dotenv/config";
import mongoose from "mongoose";
import KioskTelemetrySession from "../modules/telemetry/model/kioskTelemetrySession.model.js";
import KioskTelemetryRollup from "../modules/telemetry/model/kioskTelemetryRollup.model.js";
import { backfillTelemetryAggregatesFromRawEvents } from "../modules/telemetry/service/telemetry.aggregate.service.js";

function parseArgs(argv) {
  const args = {
    reset: false,
    franchiseId: null,
    outletId: null,
    deviceId: null,
    visitorSessionId: null,
  };

  for (const token of argv) {
    if (token === "--reset") args.reset = true;
    else if (token.startsWith("--franchiseId=")) {
      args.franchiseId = token.split("=")[1] || null;
    } else if (token.startsWith("--outletId=")) {
      args.outletId = token.split("=")[1] || null;
    } else if (token.startsWith("--deviceId=")) {
      args.deviceId = token.split("=")[1] || null;
    } else if (token.startsWith("--visitorSessionId=")) {
      args.visitorSessionId = token.split("=")[1] || null;
    }
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const filters = {
    franchiseId: args.franchiseId,
    outletId: args.outletId,
    deviceId: args.deviceId,
    visitorSessionId: args.visitorSessionId,
  };

  const scope = {};
  if (filters.franchiseId) scope.franchiseId = filters.franchiseId;
  if (filters.outletId) scope.outletId = filters.outletId;
  if (filters.deviceId) scope.deviceId = filters.deviceId;
  if (filters.visitorSessionId)
    scope.visitorSessionId = filters.visitorSessionId;

  if (args.reset) {
    const [sessionsDeleted, rollupsDeleted] = await Promise.all([
      KioskTelemetrySession.deleteMany(scope),
      KioskTelemetryRollup.deleteMany(scope),
    ]);

    console.log("[telemetry-backfill] reset", {
      sessionsDeleted: sessionsDeleted.deletedCount,
      rollupsDeleted: rollupsDeleted.deletedCount,
    });
  }

  const result = await backfillTelemetryAggregatesFromRawEvents(filters);

  const [sessionCount, rollupCount] = await Promise.all([
    KioskTelemetrySession.countDocuments(scope),
    KioskTelemetryRollup.countDocuments(scope),
  ]);

  console.log("[telemetry-backfill] done", {
    ...result,
    sessionCount,
    rollupCount,
  });
}

main()
  .catch((error) => {
    console.error("[telemetry-backfill] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
