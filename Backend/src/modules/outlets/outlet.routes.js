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

// Create Outlet
router.post(
  "/",
  authorize(PERMISSIONS.OUTLET_CREATE),
  createOutletController
);

// Get All Outlets
router.get(
  "/",
  authorize(PERMISSIONS.OUTLET_VIEW),
  getOutletsController
);

// Get One Outlet
router.post(
  "/get-one",
  authorize(PERMISSIONS.OUTLET_VIEW),
  getOutletByIdController
);

// Update Outlet
router.put(
  "/",
  authorize(PERMISSIONS.OUTLET_UPDATE),
  updateOutletController
);

// Delete Outlet
router.delete(
  "/",
  authorize(PERMISSIONS.OUTLET_DELETE),
  deleteOutletController
);

export default router;
