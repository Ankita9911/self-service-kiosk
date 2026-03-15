import express from "express";
import { authenticate } from "../../core/auth/middleware/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import { uploadSchema } from "./validation/upload.schemas.js";
import { generateUploadUrl } from "./controller/upload.controller.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  attachTenant,
  validate(uploadSchema),
  generateUploadUrl,
);

export default router;
