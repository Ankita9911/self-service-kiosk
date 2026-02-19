import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";

import {
  createFranchiseController,
  getFranchisesController,
  getFranchiseByIdController,
  updateFranchiseController,
  deleteFranchiseController,
} from "./franchise.controller.js";

const router = express.Router();

router.use(authenticate);

// Create Franchise
router.post(
  "/",
  authorize(PERMISSIONS.FRANCHISE_CREATE),
  createFranchiseController
);

// Get All Franchises
router.get(
  "/",
  authorize(PERMISSIONS.FRANCHISE_VIEW),
  getFranchisesController
);

// Get One Franchise
router.post(
  "/get-one",
  authorize(PERMISSIONS.FRANCHISE_VIEW),
  getFranchiseByIdController
);

// Update Franchise
router.put(
  "/",
  authorize(PERMISSIONS.FRANCHISE_UPDATE),
  updateFranchiseController
);

// Delete Franchise
router.delete(
  "/",
  authorize(PERMISSIONS.FRANCHISE_DELETE),
  deleteFranchiseController
);

export default router;
