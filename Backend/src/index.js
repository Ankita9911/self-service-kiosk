import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import connectMongo from "./shared/utils/mongo.js";
import { initSocket } from "./realtime/realtime.manager.js";
import { startWorker } from "./core/queue/queue.worker.js";
import { getRedisClient } from "./core/cache/redis.client.js";
import {
  startAnalyticsCron,
  stopAnalyticsCron,
} from "./modules/analytics/service/analytics.cron.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
let server;

async function verifyRedis() {
  const redis = getRedisClient();
  await redis.ping();
}

async function bootstrap() {
  try {
    console.log("Starting Hyper Kitchen Hub Backend...");

    await connectMongo();
    console.log("MongoDB connected");

    await verifyRedis();
    console.log("Redis connected");

    server = http.createServer(app);
    initSocket(server);
    startWorker();
    startAnalyticsCron();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    registerShutdownHandlers();
  } catch (error) {
    console.error("Server bootstrap failed:", error);
    process.exit(1);
  }
}

function registerShutdownHandlers() {
  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    stopAnalyticsCron();
    if (server) {
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    }
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap();
