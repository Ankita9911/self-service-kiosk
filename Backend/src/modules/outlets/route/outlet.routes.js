import express from "express";
import { authenticate } from "../../../core/auth/auth.middleware.js";
import { authorize } from "../../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../../core/rbac/permissions.js";
import { validate } from "../../../shared/validation/validate.middleware.js";
import {
  createOutletSchema,
  updateOutletSchema,
  setOutletStatusSchema,
} from "../validation/outlet.schemas.js";
import {
  createOutletController,
  getOutletsController,
  updateOutletController,
  deleteOutletController,
  getOutletByIdController,
  setOutletStatusController,
} from "../controller/outlet.controller.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  authorize(PERMISSIONS.OUTLET_CREATE),
  validate(createOutletSchema),
  createOutletController,
);

router.get("/", authorize(PERMISSIONS.OUTLET_VIEW), getOutletsController);

router.get("/:id", authorize(PERMISSIONS.OUTLET_VIEW), getOutletByIdController);

router.put(
  "/:id",
  authorize(PERMISSIONS.OUTLET_UPDATE),
  validate(updateOutletSchema),
  updateOutletController,
);

router.delete(
  "/:id",
  authorize(PERMISSIONS.OUTLET_DELETE),
  deleteOutletController,
);

router.patch(
  "/:id/status",
  authorize(PERMISSIONS.OUTLET_UPDATE),
  validate(setOutletStatusSchema),
  setOutletStatusController,
);

export default router;
