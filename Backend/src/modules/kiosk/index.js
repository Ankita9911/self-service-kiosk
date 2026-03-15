import express from "express";
import { authenticate } from "../../core/auth/middleware/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as controller from "./controller/kiosk.controller.js";
import recommendationRoutes from "../recommendations/index.js";

const router = express.Router();

router.use(authenticate, attachTenant, authorize(PERMISSIONS.ORDERS_CREATE));

router.get("/menu", controller.getMenu);
router.get("/combos", controller.getCombos);
router.use("/recommendations", recommendationRoutes);

export default router;
