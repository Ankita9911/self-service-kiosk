import express from "express";

import authRoutes from "../core/auth/auth.routes.js";

import franchiseRoutes from "../modules/franchises/franchise.routes.js";
import outletRoutes from "../modules/outlets/outlet.routes.js";
import menuRoutes from "../modules/menu/menu.routes.js";
import comboRoutes from "../modules/menu/combo.routes.js";
import kioskRoutes from "../modules/kiosk/kiosk.routes.js";
import orderRoutes from "../modules/orders/order.routes.js";
import deviceRoutes from "../modules/devices/device.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import ingredientRoutes from "../modules/ingredients/ingredient.routes.js";
import recipeRoutes from "../modules/recipes/recipe.routes.js";
import stockTransactionRoutes from "../modules/stockTransactions/stockTransaction.routes.js";

import { authenticate } from "../core/auth/auth.middleware.js";
import { attachTenant } from "../core/tenancy/tenancy.middleware.js";

import uploadRoutes from "../modules/upload/upload.routes.js";
import analyticsRoutes from "../modules/analytics/analytics.routes.js";
import recommendationRoutes from "../modules/recommendations/recommendation.routes.js";

const router = express.Router();
router.get(
  "/tenant-test",
  authenticate,
  attachTenant,
  (req, res) => {
    res.json({
      success: true,
      data: {
        tenant: req.tenant,
      },
    });
  }
);

router.use("/auth", authRoutes);

router.use("/franchises", franchiseRoutes);
router.use("/outlets", outletRoutes);
router.use("/menu", menuRoutes);
router.use("/combos", comboRoutes);
router.use("/kiosk", kioskRoutes);
router.use("/orders", orderRoutes);
router.use("/devices", deviceRoutes);
router.use("/users", userRoutes);
router.use("/upload", uploadRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/ingredients", ingredientRoutes);
router.use("/recipes", recipeRoutes);
router.use("/stock-transactions", stockTransactionRoutes);
router.use("/kiosk/recommendations", recommendationRoutes);

export default router;
