import express from "express";
import { authenticate } from "../../../core/auth/auth.middleware.js";
import { attachTenant } from "../../../core/tenancy/tenancy.middleware.js";
import { authorize } from "../../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../../core/rbac/permissions.js";
import { validate } from "../../../shared/validation/validate.middleware.js";
import { createOrderSchema, updateOrderStatusSchema } from "../validation/order.schemas.js";
import * as controller from "../controller/order.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant);

router.post(
  "/",
  authorize(PERMISSIONS.ORDERS_CREATE),
  validate(createOrderSchema),
  controller.createOrder,
);

router.get(
  "/client/:clientOrderId/status",
  authorize(PERMISSIONS.ORDERS_CREATE),
  controller.getOrderProcessingStatus,
);

router.get("/", authorize(PERMISSIONS.ORDERS_VIEW), controller.listOrders);

router.patch(
  "/:id/status",
  authorize(PERMISSIONS.ORDERS_UPDATE_STATUS),
  validate(updateOrderStatusSchema),
  controller.updateOrderStatus,
);

export default router;
