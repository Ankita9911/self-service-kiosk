import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import { requireDevice, requireUser } from "./device.middleware.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import {
  createDeviceSchema,
  updateDeviceSchema,
  setDeviceStatusSchema,
  heartbeatSchema,
} from "./device.schemas.js";
import * as controller from "./device.controller.js";
import { deviceLoginController } from "./device.auth.controller.js";

const router = express.Router();

router.post("/login", deviceLoginController);

router.post(
  "/heartbeat",
  authenticate,
  requireDevice,
  validate(heartbeatSchema),
  controller.heartbeatController
);

router.use(authenticate, requireUser);

router.post(
  "/",
  authorize(PERMISSIONS.DEVICE_CREATE),
  validate(createDeviceSchema),
  controller.createDeviceController
);

router.get(
  "/",
  authorize(PERMISSIONS.DEVICE_VIEW),
  controller.listDevicesController
);

router.patch(
  "/:deviceId/status",
  authorize(PERMISSIONS.DEVICE_CHANGE_STATUS),
  validate(setDeviceStatusSchema),
  controller.setDeviceStatusController
);

router.patch(
  "/:deviceId",
  authorize(PERMISSIONS.DEVICE_UPDATE),
  validate(updateDeviceSchema),
  controller.updateDeviceController
);

router.delete(
  "/:deviceId",
  authorize(PERMISSIONS.DEVICE_DELETE),
  controller.deleteDeviceController
);

router.post(
  "/:deviceId/reset-secret",
  authorize(PERMISSIONS.DEVICE_UPDATE),
  controller.resetSecretController
);

export default router;
