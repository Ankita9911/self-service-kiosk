import { z } from "zod";
import {
  emailSchema,
  statusSchema,
} from "../../../shared/validation/common.schemas.js";

export const createFranchiseSchema = z.object({
  name: z.string({ required_error: "name is required" }).min(1).trim(),
  brandCode: z
    .string({ required_error: "brandCode is required" })
    .min(1)
    .trim()
    .toUpperCase(),
  contactEmail: emailSchema,
  contactPhone: z.string().trim().optional(),
});

export const updateFranchiseSchema = createFranchiseSchema.partial();

export const setFranchiseStatusSchema = z.object({
  status: statusSchema,
});
