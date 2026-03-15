import express from "express";
import {
  loginController,
  logoutController,
  meController,
  forceResetPasswordController,
} from "../controller/auth.controller.js";
import { requireUser } from "../../../modules/devices/middleware/device.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../../../shared/validation/validate.middleware.js";
import { loginSchema, forceResetPasswordSchema } from "../validation/auth.schemas.js";

const router = express.Router();

router.post("/login", validate(loginSchema), loginController);
router.post("/logout", authenticate, logoutController);
router.get("/me", authenticate, meController);
router.post(
  "/force-reset-password",
  authenticate,
  requireUser,
  validate(forceResetPasswordSchema),
  forceResetPasswordController,
);

export default router;
