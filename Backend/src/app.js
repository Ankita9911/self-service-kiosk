import express from "express";
import cors from "cors";
import helmet from "helmet";

import routes from "./routes/index.js";
import errorMiddleware from "./shared/errors/error.middleware.js";
import AppError from "./shared/errors/AppError.js";
import { sendSuccess } from "./shared/utils/response.js";

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  return sendSuccess(res, {
    message: "Service healthy",
    data: {
      uptime: process.uptime(),
    },
  });
});

app.use("/api", routes);

app.use((req, res, next) => {
  next(new AppError("Route not found", 404, "ROUTE_NOT_FOUND"));
});

app.use(errorMiddleware);

export default app;