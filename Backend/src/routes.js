import express from "express";
import authRoutes from "./core/auth/auth.routes.js";
import { authenticate } from "./core/auth/auth.middleware.js";
import { PERMISSIONS } from "./core/rbac/permissions.js";
import { authorize } from "./core/rbac/rbac.middleware.js";

const router = express.Router();

router.get(
  "/admin-only",
  authenticate,
  authorize(PERMISSIONS.FRANCHISE_MANAGE),
  (req, res) => {
    res.json({
      message: "You have franchise management permission",
    });
  }
);

router.use("/auth", authRoutes);

export default router;
