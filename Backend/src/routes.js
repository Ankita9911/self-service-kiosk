import express from "express";
import authRoutes from "./core/auth/auth.routes.js";
import { authenticate } from "./core/auth/auth.middleware.js";
import { PERMISSIONS } from "./core/rbac/permissions.js";
import { authorize } from "./core/rbac/rbac.middleware.js";
import { attachTenant } from "./core/tenancy/tenancy.middleware.js";
import franchiseRoutes from "./modules/franchises/franchise.routes.js"
import outletRoutes from "./modules/outlets/outlet.routes.js"
import menuRoutes from "./modules/menu/menu.routes.js"
import kioskRoutes from "./modules/kiosk/kiosk.routes.js"
import orderRoutes from "./modules/orders/order.routes.js"
const router = express.Router();


router.get(
  "/tenant-test",
  authenticate,
  attachTenant,
  (req, res) => {
    res.json({
      tenant: req.tenant,
    });
  }
);

router.use("/auth", authRoutes);
router.use("/franchises", franchiseRoutes);
router.use("/outlets", outletRoutes);
router.use("/menu", menuRoutes);
router.use("/kiosk", kioskRoutes);
router.use("/orders", orderRoutes);
export default router;
