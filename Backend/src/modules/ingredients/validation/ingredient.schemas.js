import { z } from "zod";
import { INGREDIENT_UNIT } from "../constant/ingredient.constants.js";

export const createIngredientSchema = z.object({
  name: z.string({ required_error: "name is required" }).min(1).trim(),
  unit: z.enum(Object.values(INGREDIENT_UNIT), {
    required_error: "unit is required",
  }),
  currentStock: z.number().nonnegative().optional().default(0),
  minThreshold: z.number().nonnegative().optional().default(0),
});

export const updateIngredientSchema = z.object({
  name: z.string().min(1).trim().optional(),
  unit: z.enum(Object.values(INGREDIENT_UNIT)).optional(),
  minThreshold: z.number().nonnegative().optional(),
});

export const adjustStockSchema = z.object({
  quantity: z
    .number({ required_error: "quantity is required" })
    .refine((v) => v !== 0, { message: "quantity must be non-zero" }),
  note: z.string().trim().optional(),
});
