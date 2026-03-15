import { z } from "zod";
import {
  objectIdSchema,
  emailSchema,
  passwordSchema,
} from "../../shared/validation/common.schemas.js";
import { USER_ROLE, USER_STATUS } from "./user.constants.js";

export const createUserSchema = z.object({
  name: z.string({ required_error: "name is required" }).min(1).trim(),
  email: emailSchema,
  role: z.enum(Object.values(USER_ROLE), {
    required_error: "role is required",
  }),
  franchiseId: objectIdSchema.optional(),
  outletId: objectIdSchema.optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).trim().optional(),
});

export const changeRoleSchema = z.object({
  role: z.enum(Object.values(USER_ROLE), {
    required_error: "role is required",
  }),
});

export const changeStatusSchema = z.object({
  status: z.enum(Object.values(USER_STATUS), {
    required_error: "status is required",
  }),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});
