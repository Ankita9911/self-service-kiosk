import express from "express";
import {
  loginController,
  logoutController,
  meController,
  forceResetPasswordController,
} from "./auth.controller.js";
import { requireUser } from "../../modules/devices/device.middleware.js";
import { authenticate } from "./auth.middleware.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import { loginSchema, forceResetPasswordSchema } from "./auth.schemas.js";

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
