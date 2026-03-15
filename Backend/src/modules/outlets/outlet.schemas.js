import { z } from "zod";
import {
  objectIdSchema,
  statusSchema,
} from "../../shared/validation/common.schemas.js";

const addressSchema = z
  .object({
    line1: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
    country: z.string().trim().optional(),
  })
  .optional();

export const createOutletSchema = z.object({
  name: z.string({ required_error: "name is required" }).min(1).trim(),
  outletCode: z
    .string({ required_error: "outletCode is required" })
    .min(1)
    .trim()
    .toUpperCase(),
  franchiseId: objectIdSchema.optional(),
  address: addressSchema,
});

export const updateOutletSchema = createOutletSchema.partial();

export const setOutletStatusSchema = z.object({
  status: statusSchema,
});
