import express from "express";
import { authenticate } from "../../../core/auth/auth.middleware.js";
import { authorize } from "../../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../../core/rbac/permissions.js";
import { validate } from "../../../shared/validation/validate.middleware.js";
import {
  createFranchiseSchema,
  updateFranchiseSchema,
  setFranchiseStatusSchema,
} from "../validation/franchise.schemas.js";
import {
  createFranchiseController,
  getFranchisesController,
  getFranchiseByIdController,
  updateFranchiseController,
  deleteFranchiseController,
  setFranchiseStatusController,
} from "../controller/franchise.controller.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  authorize(PERMISSIONS.FRANCHISE_CREATE),
  validate(createFranchiseSchema),
  createFranchiseController,
);

router.get("/", authorize(PERMISSIONS.FRANCHISE_VIEW), getFranchisesController);

router.post(
  "/get-one",
  authorize(PERMISSIONS.FRANCHISE_VIEW),
  getFranchiseByIdController,
);

router.put(
  "/:id",
  authorize(PERMISSIONS.FRANCHISE_UPDATE),
  validate(updateFranchiseSchema),
  updateFranchiseController,
);

router.delete(
  "/:id",
  authorize(PERMISSIONS.FRANCHISE_DELETE),
  deleteFranchiseController,
);

router.patch(
  "/:id/status",
  authorize(PERMISSIONS.FRANCHISE_UPDATE),
  validate(setFranchiseStatusSchema),
  setFranchiseStatusController,
);

export default router;
