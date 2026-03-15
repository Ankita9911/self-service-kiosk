import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";
import errorMiddleware from "./shared/errors/error.middleware.js";
import AppError from "./shared/errors/AppError.js";
import { sendSuccess } from "./shared/utils/response.js";
import env from "./config/env.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(
      JSON.stringify({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ms: Date.now() - start,
      }),
    );
  });
  next();
});

app.get("/health", (req, res) => {
  return sendSuccess(res, {
    message: "Service healthy",
    data: { uptime: process.uptime() },
  });
});

app.use("/api/v1", routes);
app.use("/api", routes);

app.use((req, res, next) => {
  next(new AppError("Route not found", 404, "ROUTE_NOT_FOUND"));
});

app.use(errorMiddleware);

export default app;
