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
router.use(authorize(PERMISSIONS.FRANCHISE_MANAGE));

router.post("/", createFranchiseController);
router.get("/", getFranchisesController);

router.post("/get-one", getFranchiseByIdController);
router.put("/", updateFranchiseController);
router.delete("/", deleteFranchiseController);

export default router;
