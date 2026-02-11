import express from "express";
import cors from "cors";
import helmet from "helmet";

import routes from "./routes.js";
import errorMiddleware from "./shared/errors/error.middleware.js";
import AppError from "./shared/errors/AppError.js";

const app = express();

// Security headers
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
  });
});

app.use("/api", routes);

app.use((req, res, next) => {
  next(new AppError("Route not found", 404, "ROUTE_NOT_FOUND"));
});

app.use(errorMiddleware);

export default app;
