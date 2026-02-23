import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import connectMongo from "./shared/utils/mongo.js";
import { initSocket } from "./realtime/realtime.manager.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
let server;

async function bootstrap() {
  try {
    console.log("tarting Hyper Kitchen Hub Backend...");
    await connectMongo();
    console.log("MongoDB Connected");
    server = http.createServer(app);
    initSocket(server);
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
    console.log(`\n${signal} received. Shutting down gracefully...`);
    if (server) {
      server.close(() => {
        console.log(" HTTP server closed");
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
