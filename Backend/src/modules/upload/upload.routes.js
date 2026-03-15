import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import { uploadSchema } from "./upload.schemas.js";
import { generateUploadUrl } from "./upload.controller.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  attachTenant,
  validate(uploadSchema),
  generateUploadUrl
);

export default router;
