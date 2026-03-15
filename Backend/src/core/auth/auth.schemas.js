import { z } from "zod";
import { emailSchema, passwordSchema } from "../../shared/validation/common.schemas.js";

export const loginSchema = z.object({
  email:    emailSchema,
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

export const forceResetPasswordSchema = z.object({
  currentPassword: z.string({ required_error: "Current password is required" }).min(1, "Current password is required"),
  password:        passwordSchema,
});
