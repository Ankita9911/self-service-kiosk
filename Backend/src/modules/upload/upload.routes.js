import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { generateUploadUrl } from "./upload.controller.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  attachTenant,
  generateUploadUrl
);

export default router;