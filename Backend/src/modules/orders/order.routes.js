import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as controller from "./order.controller.js";

const router = express.Router();

router.use(
  authenticate,
  attachTenant,
  authorize(PERMISSIONS.ORDERS_CREATE)
);

router.post("/", controller.createOrder);

export default router;
