import express from "express";
import authRoutes from "./core/auth/auth.routes.js";
import { authenticate } from "./core/auth/auth.middleware.js";
import { PERMISSIONS } from "./core/rbac/permissions.js";
import { authorize } from "./core/rbac/rbac.middleware.js";
import { attachTenant } from "./core/tenancy/tenancy.middleware.js";
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

export default router;
