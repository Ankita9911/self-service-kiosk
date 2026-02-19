import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import { requireDevice, requireUser } from "./device.middleware.js";

import * as controller from "./device.controller.js";
import { deviceLoginController } from "./device.auth.controller.js";

const router = express.Router();

/**
 * =========================================
 * PUBLIC ROUTE — DEVICE LOGIN
 * =========================================
 */
router.post("/login", deviceLoginController);

/**
 * =========================================
 * DEVICE-ONLY ROUTE — HEARTBEAT
 * =========================================
 */
router.post(
  "/heartbeat",
  authenticate,
  requireDevice,
  controller.heartbeatController
);

/**
 * =========================================
 * ADMIN ROUTES (USER ONLY)
 * =========================================
 */
router.use(authenticate, requireUser);

// Create Device (Franchise Admin only)
router.post(
  "/",
  authorize(PERMISSIONS.DEVICE_CREATE),
  controller.createDeviceController
);

// List Devices
router.get(
  "/",
  authorize(PERMISSIONS.DEVICE_VIEW),
  controller.listDevicesController
);

// Update Device
router.patch(
  "/:deviceId",
  authorize(PERMISSIONS.DEVICE_UPDATE),
  controller.updateDeviceController
);

// Soft Delete Device
router.delete(
  "/:deviceId",
  authorize(PERMISSIONS.DEVICE_DELETE),
  controller.deleteDeviceController
);

// Reset Device Secret
router.post(
  "/:deviceId/reset-secret",
  authorize(PERMISSIONS.DEVICE_UPDATE),
  controller.resetSecretController
);

export default router;
