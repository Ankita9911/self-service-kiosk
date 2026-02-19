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
router.use(authorize(PERMISSIONS.OUTLET_MANAGE));

router.post("/", createOutletController);
router.get("/", getOutletsController);
router.post("/get-one", getOutletByIdController);
router.put("/", updateOutletController);
router.delete("/", deleteOutletController);

export default router;
