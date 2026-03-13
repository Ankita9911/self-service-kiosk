import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as controller from "./recommendation.controller.js";

const router = express.Router();

// All recommendation endpoints require a valid kiosk session (same as kiosk routes)
router.use(
  authenticate,
  attachTenant,
  authorize(PERMISSIONS.ORDERS_CREATE)
);

// GET /kiosk/recommendations/trending?windowHours=4&limit=8
router.get("/trending", controller.getTrending);

// GET /kiosk/recommendations/frequently-bought-together?itemIds=id1,id2&limit=5
router.get("/frequently-bought-together", controller.getFrequentlyBoughtTogether);

// GET /kiosk/recommendations/complete-meal?cartItemIds=id1,id2&cartCategoryIds=catId1&limit=4
router.get("/complete-meal", controller.getCompleteMeal);

export default router;
