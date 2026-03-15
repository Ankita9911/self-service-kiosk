import { z } from "zod";
import { objectIdSchema } from "../../shared/validation/common.schemas.js";
import { SERVICE_TYPE } from "./menu.constants.js";

const comboItemSchema = z.object({
  menuItemId: objectIdSchema,
  name: z.string().min(1).trim(),
  quantity: z.number().int().positive().optional().default(1),
});

export const createComboSchema = z.object({
  name: z.string({ required_error: "name is required" }).min(1).trim(),
  description: z.string().trim().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  items: z
    .array(comboItemSchema)
    .min(1, "Combo must contain at least one item"),
  comboPrice: z
    .number({ required_error: "comboPrice is required" })
    .nonnegative(),
  originalPrice: z.number().nonnegative().optional().default(0),
  serviceType: z
    .enum(Object.values(SERVICE_TYPE))
    .optional()
    .default(SERVICE_TYPE.BOTH),
});

export const updateComboSchema = createComboSchema.partial();
