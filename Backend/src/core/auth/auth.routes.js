import express from "express";
import { loginController } from "./auth.controller.js";
import { requireUser } from "../../modules/devices/device.middleware.js";
import { authenticate } from "./auth.middleware.js";
import { forceResetPasswordController } from "./auth.controller.js";

const router = express.Router();

router.post("/login", loginController);
router.post(
  "/force-reset-password",
  authenticate,
  requireUser,
  forceResetPasswordController
);

export default router;
