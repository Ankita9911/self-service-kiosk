import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import { requireDevice, requireUser } from "./device.middleware.js";

import * as controller from "./device.controller.js";
import { deviceLoginController } from "./device.auth.controller.js";

const router = express.Router();
router.post("/login", deviceLoginController);

router.post(
  "/heartbeat",
  authenticate,
  requireDevice,
  controller.heartbeatController,
);

router.use(authenticate, requireUser);

router.post(
  "/",
  authorize(PERMISSIONS.DEVICE_CREATE),
  controller.createDeviceController,
);

router.get(
  "/",
  authorize(PERMISSIONS.DEVICE_VIEW),
  controller.listDevicesController,
);

router.patch(
  "/:deviceId/status",
  authorize(PERMISSIONS.DEVICE_CHANGE_STATUS),
  controller.setDeviceStatusController,
);

router.patch(
  "/:deviceId",
  authorize(PERMISSIONS.DEVICE_UPDATE),
  controller.updateDeviceController,
);

router.delete(
  "/:deviceId",
  authorize(PERMISSIONS.DEVICE_DELETE),
  controller.deleteDeviceController,
);

router.post(
  "/:deviceId/reset-secret",
  authorize(PERMISSIONS.DEVICE_UPDATE),
  controller.resetSecretController,
);

export default router;
