import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";

import {
  createOutletController,
  getOutletsController,
  updateOutletController,
  deleteOutletController,
  getOutletByIdController,
} from "./outlet.controller.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  authorize(PERMISSIONS.OUTLET_CREATE),
  createOutletController
);

router.get(
  "/",
  authorize(PERMISSIONS.OUTLET_VIEW),
  getOutletsController
);

router.get(
  "/:id",
  authorize(PERMISSIONS.OUTLET_VIEW),
  getOutletByIdController
);

router.put(
  "/:id",
  authorize(PERMISSIONS.OUTLET_UPDATE),
  updateOutletController
);

router.delete(
  "/:id",
  authorize(PERMISSIONS.OUTLET_DELETE),
  deleteOutletController
);

export default router;