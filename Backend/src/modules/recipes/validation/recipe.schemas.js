import { z } from "zod";
import { objectIdSchema } from "../../../shared/validation/common.schemas.js";
import { INGREDIENT_UNIT } from "../../ingredients/constant/ingredient.constants.js";

const recipeIngredientSchema = z.object({
  ingredientId: objectIdSchema,
  quantity: z
    .number({ required_error: "quantity is required" })
    .positive("quantity must be positive"),
  unit: z.enum(Object.values(INGREDIENT_UNIT), {
    required_error: "unit is required",
  }),
});

export const createRecipeSchema = z.object({
  menuItemId: objectIdSchema,
  ingredients: z.array(recipeIngredientSchema).optional().default([]),
  prepTime: z.number().int().nonnegative().optional().default(0),
  instructions: z.string().trim().optional().default(""),
  aiGenerated: z.boolean().optional().default(false),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const aiGenerateSchema = z.object({
  description: z
    .string({ required_error: "description is required" })
    .min(1, "description cannot be empty")
    .trim(),
});
