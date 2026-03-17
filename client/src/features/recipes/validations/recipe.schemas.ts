import { z } from "zod";

const recipeIngredientRowSchema = z.object({
  ingredientId: z
    .string()
    .trim()
    .min(1, "Please select an ingredient for each row"),
  quantity: z.number().gt(0, "Ingredient quantity must be greater than zero"),
  unit: z.string().trim().min(1, "Ingredient unit is required"),
  _aiName: z.string().optional(),
});

export const recipeFormSchema = z.object({
  menuItemId: z.string().trim().min(1, "Please select a menu item"),
  ingredients: z
    .array(recipeIngredientRowSchema)
    .min(1, "Add at least one ingredient row"),
  prepTime: z.number().min(0).optional(),
  instructions: z.string().max(2000).optional(),
  aiGenerated: z.boolean().optional(),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;
