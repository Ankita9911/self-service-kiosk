import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { requireUser } from "../devices/device.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as controller from "./user.controller.js";

const router = express.Router();

router.use(authenticate, requireUser);

// Create
router.post(
  "/",
  authorize(PERMISSIONS.USERS_CREATE),
  controller.createUserController
);

// List
router.get(
  "/",
  authorize(PERMISSIONS.USERS_VIEW),
  controller.listUsersController
);

// Get
router.get(
  "/:id",
  authorize(PERMISSIONS.USERS_VIEW),
  controller.getUserController
);

// Update
router.patch(
  "/:id",
  authorize(PERMISSIONS.USERS_UPDATE),
  controller.updateUserController
);

// Delete
router.delete(
  "/:id",
  authorize(PERMISSIONS.USERS_DELETE),
  controller.deleteUserController
);

// Change Role
router.patch(
  "/:id/role",
  authorize(PERMISSIONS.USERS_CHANGE_ROLE),
  controller.changeRoleController
);

// Change Status
router.patch(
  "/:id/status",
  authorize(PERMISSIONS.USERS_CHANGE_STATUS),
  controller.changeStatusController
);

// Reset Password
router.post(
  "/:id/reset-password",
  authorize(PERMISSIONS.USERS_RESET_PASSWORD),
  controller.resetPasswordController
);

export default router;
