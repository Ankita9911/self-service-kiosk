import express from "express";
import { authenticate } from "../../core/auth/middleware/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as controller from "./controller/analytics.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant);

router.get(
  "/overview",
  authorize(PERMISSIONS.ANALYTICS_VIEW),
  controller.getOverview,
);

export default router;
