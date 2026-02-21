import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as controller from "./order.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant);

// Create Order
router.post(
  "/",
  authorize(PERMISSIONS.ORDERS_CREATE),
  controller.createOrder
);

// List Orders (Kitchen: CREATED,IN_KITCHEN,READY | Pickup: READY)
router.get(
  "/",
  authorize(PERMISSIONS.ORDERS_VIEW),
  controller.listOrders
);

// Update Order Status
router.patch(
  "/:id/status",
  authorize(PERMISSIONS.ORDERS_UPDATE_STATUS),
  controller.updateOrderStatus
);

export default router;
