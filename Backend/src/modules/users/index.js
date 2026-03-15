import express from "express";
import { authenticate } from "../../core/auth/middleware/auth.middleware.js";
import { requireUser } from "../devices/middleware/device.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  changeRoleSchema,
  changeStatusSchema,
  resetPasswordSchema,
} from "./validation/user.schemas.js";
import * as controller from "./controller/user.controller.js";

const router = express.Router();

router.use(authenticate, requireUser);

router.post(
  "/",
  authorize(PERMISSIONS.USERS_CREATE),
  validate(createUserSchema),
  controller.createUserController,
);

router.get(
  "/",
  authorize(PERMISSIONS.USERS_VIEW),
  controller.listUsersController,
);

router.get(
  "/:id",
  authorize(PERMISSIONS.USERS_VIEW),
  controller.getUserController,
);

router.patch(
  "/:id",
  authorize(PERMISSIONS.USERS_UPDATE),
  validate(updateUserSchema),
  controller.updateUserController,
);

router.delete(
  "/:id",
  authorize(PERMISSIONS.USERS_DELETE),
  controller.deleteUserController,
);

router.patch(
  "/:id/role",
  authorize(PERMISSIONS.USERS_CHANGE_ROLE),
  validate(changeRoleSchema),
  controller.changeRoleController,
);

router.patch(
  "/:id/status",
  authorize(PERMISSIONS.USERS_CHANGE_STATUS),
  validate(changeStatusSchema),
  controller.changeStatusController,
);

router.post(
  "/:id/reset-password",
  authorize(PERMISSIONS.USERS_RESET_PASSWORD),
  validate(resetPasswordSchema),
  controller.resetPasswordController,
);

export default router;
