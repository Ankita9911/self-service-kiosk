import express from "express";
import { authenticate } from "../../core/auth/middleware/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import { requireDevice } from "../devices/middleware/device.middleware.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import { createTelemetryBatchSchema } from "./validation/telemetry.schemas.js";
import * as writeController from "./controller/telemetry.write.controller.js";
import * as readController from "./controller/telemetry.read.controller.js";

const router = express.Router();

router.post(
  "/kiosk/batch",
  authenticate,
  attachTenant,
  requireDevice,
  validate(createTelemetryBatchSchema),
  writeController.createTelemetryBatch,
);

router.use(authenticate, attachTenant);

router.get(
  "/kiosk/status",
  authorize(PERMISSIONS.TELEMETRY_VIEW),
  readController.getStatus,
);

router.get(
  "/kiosk/overview",
  authorize(PERMISSIONS.TELEMETRY_VIEW),
  readController.getOverview,
);

router.get(
  "/kiosk/funnel",
  authorize(PERMISSIONS.TELEMETRY_VIEW),
  readController.getFunnel,
);

router.get(
  "/kiosk/pages",
  authorize(PERMISSIONS.TELEMETRY_VIEW),
  readController.getPages,
);

router.get(
  "/kiosk/components",
  authorize(PERMISSIONS.TELEMETRY_VIEW),
  readController.getComponents,
);

router.get(
  "/kiosk/devices",
  authorize(PERMISSIONS.TELEMETRY_VIEW),
  readController.getDevices,
);

router.get(
  "/kiosk/errors",
  authorize(PERMISSIONS.TELEMETRY_VIEW),
  readController.getErrors,
);

router.get(
  "/kiosk/sessions",
  authorize(PERMISSIONS.TELEMETRY_VIEW),
  readController.getSessions,
);

router.get(
  "/kiosk/sessions/:visitorSessionId",
  authorize(PERMISSIONS.TELEMETRY_VIEW),
  readController.getSession,
);

router.get(
  "/kiosk/sessions/:visitorSessionId/events",
  authorize(PERMISSIONS.TELEMETRY_VIEW),
  readController.getSessionEvents,
);

export default router;
