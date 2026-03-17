import express from "express";
import { authenticate } from "../../core/auth/middleware/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import { createOrderSchema, updateOrderStatusSchema } from "./validation/order.schemas.js";
import * as controller from "./controller/order.controller.js";
import * as historyController from "./controller/orderHistory.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant);

router.post(
  "/",
  authorize(PERMISSIONS.ORDERS_CREATE),
  validate(createOrderSchema),
  controller.createOrder,
);

router.get(
  "/",
  authorize(PERMISSIONS.ORDERS_VIEW),
  controller.listOrders,
);

router.get(
  "/history",
  authorize(PERMISSIONS.ORDERS_VIEW),
  historyController.getOrdersPage,
);

router.get(
  "/stats",
  authorize(PERMISSIONS.ORDERS_VIEW),
  historyController.getOrderStats,
);

// ── Param routes after all literals ───────────────────────────────────────────

router.get(
  "/client/:clientOrderId/status",
  authorize(PERMISSIONS.ORDERS_CREATE),
  controller.getOrderProcessingStatus,
);

router.patch(
  "/:id/status",
  authorize(PERMISSIONS.ORDERS_UPDATE_STATUS),
  validate(updateOrderStatusSchema),
  controller.updateOrderStatus,
);

router.get(
  "/history/:id",
  authorize(PERMISSIONS.ORDERS_VIEW),
  historyController.getOrderById,
);

export default router;
