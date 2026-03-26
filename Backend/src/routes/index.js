import express from "express";

import authRoutes from "../core/auth/route/auth.routes.js";
import franchiseRoutes from "../modules/franchises/index.js";
import outletRoutes from "../modules/outlets/index.js";
import menuRoutes from "../modules/menu/index.js";
import comboRoutes from "../modules/combo/index.js";
import kioskRoutes from "../modules/kiosk/index.js";
import orderRoutes from "../modules/orders/index.js";
import deviceRoutes from "../modules/devices/index.js";
import userRoutes from "../modules/users/index.js";
import ingredientRoutes from "../modules/ingredients/index.js";
import recipeRoutes from "../modules/recipes/index.js";
import stockTransactionRoutes from "../modules/stockTransactions/index.js";
import uploadRoutes from "../modules/upload/index.js";
import analyticsRoutes from "../modules/analytics/index.js";
import telemetryRoutes from "../modules/telemetry/index.js";
import { authenticate } from "../core/auth/middleware/auth.middleware.js";
import { attachTenant } from "../core/tenancy/tenancy.middleware.js";

const router = express.Router();

router.get("/tenant-test", authenticate, attachTenant, (req, res) => {
  res.json({ success: true, data: { tenant: req.tenant } });
});

router.use("/auth",               authRoutes);
router.use("/franchises",         franchiseRoutes);
router.use("/outlets",            outletRoutes);
router.use("/menu",               menuRoutes);
router.use("/combos",             comboRoutes);
router.use("/kiosk",              kioskRoutes);
router.use("/orders",             orderRoutes);
router.use("/devices",            deviceRoutes);
router.use("/users",              userRoutes);
router.use("/upload",             uploadRoutes);
router.use("/analytics",          analyticsRoutes);
router.use("/telemetry",          telemetryRoutes);
router.use("/ingredients",        ingredientRoutes);
router.use("/recipes",            recipeRoutes);
router.use("/stock-transactions", stockTransactionRoutes);

export default router;
