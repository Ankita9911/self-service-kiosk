import { z } from "zod";

const unitSchema = z.enum(["gram", "ml", "piece", "kg", "liter", "dozen"]);

export const ingredientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingredient name must be at least 2 characters")
    .max(100, "Ingredient name must be at most 100 characters")
    .regex(/^[a-zA-Z][a-zA-Z\s]*$/, "Ingredient name can only contain letters"),
  unit: unitSchema,
  currentStock: z.number().min(0, "Initial stock cannot be negative"),
  minThreshold: z.number().min(0, "Minimum threshold cannot be negative"),
});

export type IngredientFormValues = z.infer<typeof ingredientFormSchema>;
